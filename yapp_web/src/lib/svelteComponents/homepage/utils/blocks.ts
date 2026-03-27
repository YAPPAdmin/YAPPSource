
export interface BlockPropSchema {
    key: string;
    label: string;
    type: "text" | "textarea" | "color" | "select" | "boolean" | "array" | "number" | "image";
    default: any;

    description?: string;
    placeholder?: string;
    group?: "Content" | "Design" | "Advanced";
    options?: { label: string, value: any}[];
    itemSchema?: any;
}

export interface BlockConfig {
    name: string;
    icon: string;
    description: string;
    schema: {
        content: BlockPropSchema[];
        settings: BlockPropSchema[];
    }
}

export interface BlockNode {
    id: string;
    type: string;
    content: Record<string, any>;
    settings: Record<string, any>;
    children?: BlockNode[];
}

