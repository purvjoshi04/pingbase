import { z } from "zod";

export type AppContext = {
    Variables: {
        userId: string;
    };
};

export const AuthInput = z.object({
    username: z.string(),
    password: z.string()
});