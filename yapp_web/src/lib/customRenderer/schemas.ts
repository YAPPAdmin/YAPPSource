export type FieldType = 
    | "string"
    | "array"
    | "object"
    | "number"
    | "email"
    | "url"
    | "image"
    | "select";

export type InputType =
    | "text"
    | "textarea"
    | "number"
    | "select"
    | "checkbox"
    | "radio";

export interface BaseComponent {
    type: FieldType
    input?: InputType
    label: string,
    description?: string,
};


export interface StringField extends BaseComponent {
    type: "string",
    textDescription?: string,
}

export interface SelectField extends BaseComponent {
    type: "select",
    options: string[],
}

export interface ArrayField extends BaseComponent {
    type: "array",
    itemSchema: SchemaField[],
}

export interface ObjectField extends BaseComponent {
    type: "object",
    schema: Record<string, SchemaField>,
}

export interface ReviewField extends BaseComponent {
    reviewName: string,
    rating: number,
    outOf: number,
    logo: string,
    refrenceLink: string,
}

export interface URLField extends BaseComponent {
    urlId: string,
    urlString: string,
    urlDescription?: string,
}

export interface ImageField extends BaseComponent {
    imageId: string,
    imageTags?: string[],
    imageDescription?: string,
    imageAlt: string,
    imageLink?: URLField,
    ratio?: "1:1" | "1:2" | "4:3" | "16:9" | "21:9" | "3:2" | "9:16",
}

export interface ShopItemField extends BaseComponent {
    id: string,
    name: string,
    price: string,
    productImages?: ImageField[],
    availability: "Available" | "OutOfStock" | "PreOrder" | "ComingSoon",
    returnToStock?: Date | "soon",
    stock: number,
    properties: Record<string, string>;
}

export type Fields = 
    | StringField
    | SelectField
    | ArrayField
    | ObjectField
    | ReviewField
    | URLField
    | ImageField
    | ShopItemField 
