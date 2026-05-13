import { app } from "@pingbase/api";
import { prisma } from "@pingbase/store";

export async function setupTestUser() {
    await prisma.user.deleteMany({
        where: { username: { in: ["testuser", "newuser"] } }
    });
}

export async function getTestToken(): Promise<string> {
    const signupRes = await app.request("/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "testuser", password: "test123" }),
    });

    const data = await signupRes.json();
    return data.token;
}