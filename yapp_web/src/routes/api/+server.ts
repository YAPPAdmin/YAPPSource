import { json } from "@sveltejs/kit"

export function GET() {
    const result = "WELCOME TO THE YAPP API";

    return json(result);
}