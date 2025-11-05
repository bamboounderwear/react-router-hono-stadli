import {
        isRouteErrorResponse,
        Link,
        Links,
        Meta,
        NavLink,
        Outlet,
        Scripts,
        ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { CartProvider, useCart } from "./lib/cart-context";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
        return (
                <html lang="en">
                        <head>
                                <meta charSet="utf-8" />
                                <meta name="viewport" content="width=device-width, initial-scale=1" />
                                <Meta />
                                <Links />
                        </head>
                        <body className="bg-slate-950 text-slate-50">
                                {children}
                                <ScrollRestoration />
                                <Scripts />
                        </body>
                </html>
        );
}

export default function App() {
        return (
                <AppFrame>
                        <Outlet />
                </AppFrame>
        );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
        let message = "Oops!";
        let details = "An unexpected error occurred.";
        let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

        return (
                <AppFrame>
                        <section className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/70 p-10 text-blue-100 shadow-lg shadow-blue-500/10">
                                <h1 className="text-3xl font-semibold text-white">{message}</h1>
                                <p className="mt-4 text-base">{details}</p>
                                {stack && (
                                        <pre className="mt-6 max-h-80 overflow-x-auto overflow-y-auto rounded-2xl bg-slate-950/70 p-6 text-xs text-slate-200">
                                                <code>{stack}</code>
                                        </pre>
                                )}
                        </section>
                </AppFrame>
        );
}

function AppFrame({ children }: { children: React.ReactNode }) {
        return (
                <CartProvider>
                        <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
                                <SiteHeader />
                                <main className="flex-1 pt-24 pb-16">{children}</main>
                                <SiteFooter />
                        </div>
                </CartProvider>
        );
}

function SiteHeader() {
        const { totalItems } = useCart();

        const navigation: Array<{ to: string; label: string; end?: boolean }> = [
                { to: "/", label: "Home", end: true },
                { to: "/team", label: "Team" },
                { to: "/news", label: "News" },
                { to: "/games", label: "Games" },
                { to: "/shop", label: "Shop" },
        ];

        return (
                <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
                        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
                                <Link to="/" className="flex items-center gap-3">
                                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-base font-bold tracking-[0.2em] text-white shadow-lg shadow-blue-500/40">
                                                SS
                                        </span>
                                        <div>
                                                <p className="text-xs uppercase tracking-[0.4em] text-blue-300">Stadli Storm</p>
                                                <p className="text-base font-semibold text-white">Alpine Football Club</p>
                                        </div>
                                </Link>
                                <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-blue-100">
                                        {navigation.map((item) => (
                                                <NavLink
                                                        key={item.to}
                                                        to={item.to}
                                                        end={item.end}
                                                        className={({ isActive }) =>
                                                                `transition hover:text-white ${
                                                                        isActive ? "text-white" : "text-blue-200"
                                                                }`
                                                        }
                                                >
                                                        {item.label}
                                                </NavLink>
                                        ))}
                                </nav>
                                <Link
                                        to="/shop"
                                        className="inline-flex items-center gap-3 rounded-full border border-blue-500/60 bg-slate-900/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100 transition hover:border-blue-400 hover:text-white"
                                        aria-label={`Open cart with ${totalItems} item${totalItems === 1 ? "" : "s"}`}
                                >
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                                                {totalItems}
                                        </span>
                                        <span>Cart</span>
                                </Link>
                        </div>
                </header>
        );
}

function SiteFooter() {
        const socials = [
                { label: "Instagram", href: "https://www.instagram.com/stadlistorm" },
                { label: "X", href: "https://twitter.com/stadlistorm" },
                { label: "YouTube", href: "https://www.youtube.com/@stadlistorm" },
                { label: "TikTok", href: "https://www.tiktok.com/@stadlistorm" },
        ] as const;

        return (
                <footer className="border-t border-slate-800 bg-slate-950">
                        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 md:flex-row md:items-center md:justify-between">
                                <div>
                                        <p className="text-xs uppercase tracking-[0.4em] text-blue-300">Stadli Storm</p>
                                        <p className="mt-2 text-base text-blue-100">Forged in the Alps. Driven by the storm.</p>
                                        <p className="mt-4 text-xs text-slate-500">© {new Date().getFullYear()} Stadli Storm Football Club. All rights reserved.</p>
                                </div>
                                <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-blue-100">
                                        {socials.map((social) => (
                                                <a
                                                        key={social.href}
                                                        href={social.href}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="transition hover:text-white"
                                                >
                                                        {social.label}
                                                </a>
                                        ))}
                                </nav>
                        </div>
                </footer>
        );
}
