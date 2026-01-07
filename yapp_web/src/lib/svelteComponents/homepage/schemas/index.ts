import Contact1, { Contact1DefaultSchema, Contact1SchemaDefinition } from "./Contact/Contact1.svelte";
import Hero1, { Hero1DefaultSchema, Hero1SchemaDefinition } from "./Heroes/Hero1.svelte";
import Team1, { Team1DefaultSchema, Team1SchemaDefinition} from "./People/Team1.svelte";
import Shop1, { Shop1DefaultSchema, Shop1SchemaDefinition } from "./Shop/Shop1.svelte";

export interface ComponentRegistryItem<T> {
    component: any;
    schemaDefinition: Record<string, any>;
    schemaDefault: T;
}

export const SchemaRegistry: Record<string, ComponentRegistryItem<any>> = {
    hero1: {
        component: Hero1,
        schemaDefinition: Hero1SchemaDefinition,
        schemaDefault: Hero1DefaultSchema,
    },

    team1: {
        component: Team1,
        schemaDefinition: Team1SchemaDefinition,
        schemaDefault: Team1DefaultSchema
    },

    contact1: {
        component: Contact1,
        schemaDefinition: Contact1SchemaDefinition,
        schemaDefault: Contact1DefaultSchema,
    },

    shop1: {
        component: Shop1,
        schemaDefinition: Shop1SchemaDefinition,
        schemaDefault: Shop1DefaultSchema,
    }
}