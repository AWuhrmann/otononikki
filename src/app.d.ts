/// <reference types="@auth/sveltekit" />
declare global {
    namespace App {
        interface Locals {
            getSession(): Promise<{
                user: {
                    username: string;
                    role: string;
                    id: number;
                } | null;
            }>;
        }
    }
}

export { };