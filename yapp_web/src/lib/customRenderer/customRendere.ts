
import { popupStack } from "$lib/popups/popup";
import type { fromJSON } from "postcss";
import { v4 as uuidv4 } from "uuid";


export type MetaData = {
	creationDate: Date,
	lastUpdated: Date,
	contributer: string[],
}

export type Style = {
	colors: {
		background: string;
		surface: string;
		text: string;
		primary: string;
		secondary: string;
		tertiary: string;
		success: string;
		warning: string;
		error: string;
	},
	font: {
		family: string;
		site: string;
		lineHeight: string;
		letterSpaceing: string;
	},
	spacing: {
		margin:string;
		passing: string;
		gap: string;
	},
	radius: string;
	shadow: string;

}

export type Button = {
	type: "array"
}



export class Layout {
	id: string;
	name: string;
	type: string;
	authorId: string;
	metadata: MetaData;
	layout: LayoutSchemas;
	savedVersions: any[];

	constructor(
		id: string,
		name: string,
		type: "home" | "shop" | string,		
		authorId: string,
		metadata: MetaData,
		layout: LayoutSchemas,
		savedVersions: LayoutSchemas[],
	){
		this.id = id;
		this.name = name;
		this.type = type;
		this.authorId = authorId;
		this.metadata = metadata;
		this.layout = layout;
		this.savedVersions = savedVersions;
	}

	toJSON() {
		return {
			id: this.id.toString?.() ?? String(this.id),
			name: this.name,
			type: this.type,
			authorId: this.authorId,
			metadata: {
				...this.metadata,
				creationDate: this.metadata.creationDate
					? new Date(this.metadata.creationDate).toISOString()
					: null,

				lastUpdated: this.metadata.lastUpdated
					? new Date(this.metadata.lastUpdated).toISOString()
					: null,
			},
			layout: {
				...this.layout,
				tempMain: this.layout.tempMain
					? {
							active: this.layout.tempMain.active,
							from: this.layout.tempMain.from?.toISOString(),
							to: this.layout.tempMain.to?.toISOString(),
					}
					: undefined,
				blocks: this.layout.blocks,
				style: this.layout.style,
			},
			savedVersions: this.savedVersions?.map((version: LayoutSchemas) => ({
				...version,
				tempMain: version.tempMain
					? {
							active: version.tempMain.active,
							from: version.tempMain.from?.toISOString(),
							to: version.tempMain.to?.toISOString(),
					}
					: undefined,
			})),
		};
	}

	static fromJSON(data: any): Layout {
		if (!data) throw new Error("Invalid data for Layout.fromJSON");

		const metadata: MetaData = {
			creationDate: data.metadata?.creationDate ? new Date(data.metadata.creationDate) : undefined,
			lastUpdated: data.metadata?.lastUpdated ? new Date(data.metadata.lastUpdated) : undefined,
			contributer: data.metadata?.contributer ?? [],
		};

		const layout: LayoutSchemas = {
			main: data.layout?.main ?? undefined,
			tempMain: data.layout?.tempMain
				? {
					active: data.layout.tempMain.active,
					from: data.layout.tempMain.from ? new Date(data.layout.tempMain.from) : undefined,
					to: data.layout.tempMain.to ? new Date(data.layout.tempMain.to) : undefined,
				}
				: undefined,
			blocks: data.layout?.blocks ?? [],
			style: data.layout?.style ?? undefined,
		};

		const savedVersions = (data.savedVersions ?? []).map((v: any) => ({
			...v,
			tempMain: v.tempMain
				? {
						active: v.tempMain.active,
						from: v.tempMain.from ? new Date(v.tempMain.from) : undefined,
						to: v.tempMain.to ? new Date(v.tempMain.to) : undefined,
				  }
				: undefined,
		}));

		return new Layout(
			data.id?.toString?.() ?? String(data.id),
			data.name,
			data.type,
			data.authorId,
			metadata,
			layout,
			savedVersions
		);
	}

	static generateLayout(authorId: string, name: string, type: "home" | "shop" | string, ) {
		const metadata: MetaData = {
			creationDate: new Date(),
			lastUpdated: new Date(),
			contributer: [],
		}

		metadata.contributer.push(authorId);
		
		const schema: LayoutSchemas = {
			main: false,
			blocks: [],
		}

		const newLayout = new Layout(
			uuidv4().replace(/-/g, ""),
			name,
			type,
			authorId,
			metadata,
			schema,
			[],
		)
		
		return newLayout;
	}

    addBlock(block: any) {
        this.layout.blocks = this.layout.blocks ?? [];
        this.layout.blocks.push(block);
    }

    removeBlock(blockId: string) {
        this.layout.blocks = (this.layout.blocks ?? []).filter(b => b.id !== blockId);
    }

	sanitize() {
		this.name = "";
		this.id = "";
		this.type = "";
		this.authorId = "";
		this.metadata = {};
		this.savedVersions = [];
	}

	get blocks() {
        return this.layout.blocks ?? [];
    }

	static async getLayouts(layoutId: string | undefined, authorId: string | undefined, type: string | undefined) {
		if(!layoutId && !authorId && !type) return false;

		const params = new URLSearchParams();
		if(layoutId) params.append("layoutId", layoutId);
		if(authorId) params.append("authorId", authorId);
		if(type) params.append("type", type);

		try {
    		const result = await fetch(`/api/webpage?${params.toString()}`);

			if(!result.ok) {
				popupStack.open({
					title: "Error Getting Layout",
					type: "text",
					variant: "modal",
					message: "Error Getting Layout"
				})
			}


		} catch (error) {
			console.log(error)
		}
	}
}









export type LayoutSchemas = {
	main: boolean,
	tempMain?: {
		active: boolean,
		from?: Date,
		to?: Date,
	}
	blocks: any[],
	style?: Style,
}


export type YAPPLayout<Schema = any> = {
	id: string;
	type: "home" | string;
	blocks: YAPPComponentBase<Schema>[];
	author?: string;
	createDate?: Date;
	lastEditDate?: Date;
	changeLog?: [];
};

export interface YAPPComponentBase<Schema> {
	id: string;
	type: string;
	creation: {
		authorId: string;
		creationDate: Date;
	};
	changeLog: {
		authorId: string;
		changeDate: Date;
		state: Schema;
	}[];
	schema: Schema;
	component?: any;
	schemaDefinition?: any;
}


