const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

function getToken(): string | null {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

export async function apiFetch(
    path: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = getToken();
    return fetch(`${BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
}

export const api = {
    user: {
        signup: (username: string, password: string) =>
            apiFetch("/user/signup", {
                method: "POST",
                body: JSON.stringify({ username, password }),
            }),
        signin: (username: string, password: string) =>
            apiFetch("/user/signin", {
                method: "POST",
                body: JSON.stringify({ username, password }),
            }),
    },
    websites: {
        create: (url: string, name: string, checkInterval: number) =>
            apiFetch("/websites", {
                method: "POST",
                body: JSON.stringify({ url, name, checkInterval }),
            }),
        getAll: () =>
            apiFetch("/websites"),
        getStatus: (websiteId: string) =>
            apiFetch(`/websites/status/${websiteId}`),
        update: (websiteId: string, url: string, name: string) =>
            apiFetch(`/websites/${websiteId}`, {
                method: "PATCH",
                body: JSON.stringify({ url, name }),
            }),
        delete: (websiteId: string) =>
            apiFetch(`/websites/${websiteId}`, { method: "DELETE" }),
    },
};