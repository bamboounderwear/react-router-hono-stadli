import { Link } from "react-router";

import type { Route } from "./+types/shop";
import { getShopItems } from "../data/club";

export function meta({}: Route.MetaArgs) {
        return [
                { title: "Stadli Storm • Shop" },
                {
                        name: "description",
                        content: "Official Stadli Storm merchandise including kits, scarves, and training gear.",
                },
        ];
}

export function loader() {
        return { items: getShopItems() };
}

export default function Shop({ loaderData }: Route.ComponentProps) {
        const { items } = loaderData;

        return (
                <div className="bg-slate-950 text-slate-50">
                        <section className="border-b border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-900">
                                <div className="mx-auto max-w-6xl px-4 py-16">
                                        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Official Store</p>
                                        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Storm Merchandise</h1>
                                        <p className="mt-4 max-w-3xl text-base text-blue-100">
                                                Premium gear engineered for alpine matchdays. Every purchase supports the Future Academy and community clinics.
                                        </p>
                                </div>
                        </section>

                        <section className="mx-auto max-w-6xl px-4 py-16">
                                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                        {items.map((item) => (
                                                <article
                                                        key={item.id}
                                                        className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-lg shadow-blue-500/10"
                                                >
                                                        <div className="h-56 bg-cover bg-center" style={{ backgroundImage: `url(${item.imageUrl})` }} />
                                                        <div className="flex flex-1 flex-col justify-between p-6">
                                                                <div>
                                                                        <p className="text-xs uppercase tracking-[0.3em] text-blue-300">Storm Authentics</p>
                                                                        <h2 className="mt-3 text-2xl font-semibold text-white">{item.name}</h2>
                                                                        <p className="mt-3 text-sm text-blue-100">{item.description}</p>
                                                                </div>
                                                                <div className="mt-6 flex items-center justify-between">
                                                                        <p className="text-lg font-semibold text-blue-200">CHF {item.price.toFixed(0)}</p>
                                                                        <Link
                                                                                to={`/shop/${item.id}`}
                                                                                className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-blue-400"
                                                                        >
                                                                                View →
                                                                        </Link>
                                                                </div>
                                                        </div>
                                                </article>
                                        ))}
                                </div>
                        </section>
                </div>
        );
}
