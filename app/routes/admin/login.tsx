import { Form, Link, redirect, useActionData, useNavigation } from "react-router";

import type { Route } from "./+types/login";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { callApi, forwardSetCookie } from "../../utils/api.server";

type ActionData = { error: string } | undefined;

export async function loader({ request }: Route.LoaderArgs) {
        const response = await callApi(request, "/api/auth/me");

        if (response.ok) {
                throw redirect("/admin");
        }

        return {};
}

export async function action({ request }: Route.ActionArgs) {
        const formData = await request.formData();
        const email = formData.get("email");
        const password = formData.get("password");

        if (typeof email !== "string" || typeof password !== "string") {
                return { error: "Email and password are required" } satisfies ActionData;
        }

        const apiResponse = await callApi(request, "/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: email, password }),
        });

        if (apiResponse.ok) {
                const headers = forwardSetCookie(apiResponse);
                return redirect("/admin", { headers });
        }

        const result = await apiResponse.json().catch(() => ({ error: "Invalid credentials" }));
        const message = typeof (result as { error?: unknown }).error === "string"
                ? (result as { error: string }).error
                : "Invalid credentials";

        return { error: message } satisfies ActionData;
}

export default function AdminLogin() {
        const actionData = useActionData<ActionData>();
        const navigation = useNavigation();
        const isSubmitting = navigation.state === "submitting";

        return (
                <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-16">
                        <Card className="w-full max-w-md border-slate-800 bg-slate-900/90">
                                <CardHeader className="space-y-2 text-center">
                                        <CardTitle className="text-2xl font-semibold text-white">Admin sign in</CardTitle>
                                        <CardDescription>
                                                Access the Stadli Storm control center. Only credentialed club staff should proceed.
                                        </CardDescription>
                                </CardHeader>
                                <CardContent>
                                        {actionData?.error && (
                                                <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
                                                        {actionData.error}
                                                </div>
                                        )}
                                        <Form method="post" className="space-y-4">
                                                <div className="space-y-2 text-left">
                                                        <Label htmlFor="email">Email</Label>
                                                        <Input id="email" name="email" type="email" placeholder="you@stadlistorm.ch" required />
                                                </div>
                                                <div className="space-y-2 text-left">
                                                        <Label htmlFor="password">Password</Label>
                                                        <Input id="password" name="password" type="password" required />
                                                </div>
                                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                                        {isSubmitting ? "Signing in..." : "Sign in"}
                                                </Button>
                                        </Form>
                                        <p className="mt-6 text-center text-xs text-slate-400">
                                                Need help? Contact the digital operations team or return to the {" "}
                                                <Link to="/" className="text-blue-300 hover:text-white">
                                                        main site
                                                </Link>
                                                .
                                        </p>
                                </CardContent>
                        </Card>
                </div>
        );
}
