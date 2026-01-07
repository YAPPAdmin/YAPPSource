import { SurrealDB } from "$lib/database/newSurrealDB";
import type { User } from "$lib/utils/auth/User";
import { Logger } from "$lib/utils/logger";
import { Layout } from "./customRendere";

export class LayoutService {
	static async saveLayout(layout: Layout, dbUser: User) {
		if (!layout) return;

		try {
			const layoutData = layout.toJSON ? layout.toJSON() : layout;

			let result;

			if (layoutData.id?.includes(":")) {
				result = await SurrealDB.update(layoutData);

			} else {
				result = await SurrealDB.create({table: "layout", data: layoutData});
			}

			if (!result) {
				Logger.warn(
					"[LAYOUT]", "Error saving Layout to DB", "Error Saving Layout to DB", {}, { id: dbUser.getId(), email: dbUser.getEmail() }
				);
				return null;
			}

			return result;
		} catch (error) {
			Logger.warn("[LAYOUT]", "Error Saving Layout to DB", String(error), {}, { id: dbUser.getId(), email: dbUser.getEmail() });
			return null;
		}
	}

	static async getLayoutRegistry() {
        try {
            // Get all layouts from the DB
            const layouts = await SurrealDB.select({table: "layout"});

            if (!layouts || !Array.isArray(layouts)) {
                console.warn("[LayoutService] No layouts found or invalid response");
                return [];
            }

            // Map only necessary properties
			return layouts.map((layout: any) => ({
				id: layout.id?.toString?.() ?? String(layout.id),
				name: layout.name,
				authorId: layout.authorId,
				metadata: layout.metadata
			}));

        } catch (error) {
            console.error("Error fetching layout registry:", error);
            return [];
        }
    }

	static async getLayout(layoutId: string) {
		if (!layoutId) return null;

		let result = await SurrealDB.select({table: "layout", id: layoutId});

		console.log("\n\n\nDB\n")
		console.log(result)

		result = Layout.fromJSON(result[0])

		console.log(result)

		if(!result) {
			console.log("Layout Not Found")
		}
		
		return result;
	}

	static async renderLayout() {
		const registry = await LayoutService.getLayoutRegistry();

		// No layouts exist
		if (!registry || registry.length === 0) {
			console.warn("[LayoutService] No layouts exist");
			return null;
		}

		const layout = await this.getLayout(registry[0].id);

		if (!layout) {
			console.warn("[LayoutService] Layout not found:", registry[0].id);
			return null;
		}

		return layout.layout;
	}
}
