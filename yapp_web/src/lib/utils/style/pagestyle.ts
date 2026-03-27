export interface ThemeTokens {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    borderRadius: "none" | "sm" | "md" | "lg" | "full";
}

export class CustomTheme {
    constructor(
        public id: string,
        public name: string,
        public type: "dark" | "light",
        public tokens: ThemeTokens,
    ) { }
}
