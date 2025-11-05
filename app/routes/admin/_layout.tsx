import { Form, NavLink, Outlet, redirect, useNavigation } from "react-router";

import type { Route } from "./+types/_layout";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { callApi, forwardSetCookie } from "../../utils/api.server";

export type AdminOutletContext = {
        user: { username: string; name: string; role: string };
};

const navigationLinks = [
        { to: "/admin", label: "Dashboard", end: true },
        { to: "/admin/content", label: "Content" },
        { to: "/admin/analytics", label: "Analytics" },
        { to: "/admin/crm", label: "CRM" },
];

export async function loader({ request }: Route.LoaderArgs) {
        const response = await callApi(request, "/api/auth/me");

        if (!response.ok) {
                const headers = forwardSetCookie(response);
                throw redirect("/admin/login", { headers });
        }

        const { user } = (await response.json()) as { user: { username: string; name: string; role: string } };

        return { user };
}

export async function action({ request }: Route.ActionArgs) {
        const formData = await request.formData();
        const intent = formData.get("intent");

        if (intent === "logout") {
                const apiResponse = await callApi(request, "/api/auth/logout", { method: "POST" });
                const headers = forwardSetCookie(apiResponse);
                return redirect("/admin/login", { headers });
        }

        return { ok: true };
}

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
        const { user } = loaderData;
        const navigation = useNavigation();
        const isNavigating = navigation.state !== "idle";

        return (
                <div className="min-h-screen bg-slate-950 text-slate-100">
                        <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur">
                                <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
                                        <div>
                                                <p className="text-xs uppercase tracking-[0.3em] text-blue-400">Stadli Storm</p>
                                                <h1 className="text-xl font-semibold text-white">Admin Control Center</h1>
                                        </div>
                                        <div className="flex flex-col items-start gap-2 text-sm text-slate-300 md:flex-row md:items-center md:gap-4">
                                                <div>
                                                        <p className="font-medium text-white">{user.name}</p>
                                                        <p className="text-xs uppercase tracking-[0.3em] text-blue-300">{user.role}</p>
                                                </div>
                                                <Form method="post">
                                                        <input type="hidden" name="intent" value="logout" />
                                                        <Button variant="outline" size="sm" type="submit">
                                                                Log out
                                                        </Button>
                                                </Form>
                                        </div>
                                </div>
                                <nav className="mx-auto flex max-w-6xl gap-2 px-6 pb-4">
                                        {navigationLinks.map((item) => (
                                                <NavLink
                                                        key={item.to}
                                                        to={item.to}
                                                        end={item.end}
                                                        className={({ isActive }) =>
                                                                cn(
                                                                        "rounded-lg px-3 py-2 text-sm font-medium transition",
                                                                        isActive
                                                                                ? "bg-slate-900 text-white"
                                                                                : "text-slate-300 hover:bg-slate-900/60 hover:text-white",
                                                                )
                                                        }
                                                >
                                                        {item.label}
                                                </NavLink>
                                        ))}
                                </nav>
                        </header>
                        <main
                                className="mx-auto max-w-6xl px-6 py-10"
                                aria-busy={isNavigating ? "true" : "false"}
                        >
                                <Outlet context={{ user }} />
                        </main>
                </div>
        );
}
