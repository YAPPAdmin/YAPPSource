export interface ComponentRegistryItem<T> {
    component: any;
    schemaDefinition: Record<string, any>;
    schemaDefault: T;
}

export const SchemaRegistry: Record<string, ComponentRegistryItem<any>> = {

}