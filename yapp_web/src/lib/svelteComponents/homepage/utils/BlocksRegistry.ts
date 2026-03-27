import type { BlockConfig } from "./blocks";

const modules = import.meta.glob("../modules/**/*.svelte", { eager: true });

export const BlockRegistry: Record<string, { component: any } & BlockConfig> = {};

for(const path in modules) {
    const mod = modules[path] as any;

    if(mod.blockConfig) {
        const id = path.split("/").pop()?.replace(".svelte", "");
        if(id) {
            BlockRegistry[id] = {
                component: mod.default,
                ...mod.blockConfig
            };
        }
    }
}