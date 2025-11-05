export async function callApi(request: Request, path: string, init: RequestInit = {}) {
        const url = new URL(path, request.url);
        const headers = new Headers(init.headers ?? {});
        const cookie = request.headers.get("cookie");

        if (cookie && !headers.has("cookie")) {
                headers.set("cookie", cookie);
        }

        const finalInit: RequestInit = {
                ...init,
                headers,
                credentials: "include",
        };

        return fetch(url.toString(), finalInit);
}

export function forwardSetCookie(from: Response, headers: Headers = new Headers()) {
        const setCookie = from.headers.get("set-cookie");

        if (setCookie) {
                headers.append("set-cookie", setCookie);
        }

        return headers;
}
