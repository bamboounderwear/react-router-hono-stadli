import { Link } from "react-router";

import type { Route } from "./+types/news";
import { getNewsArticles } from "../data/club";

export function meta({}: Route.MetaArgs) {
        return [
                { title: "Stadli Storm • News" },
                {
                        name: "description",
                        content: "Read the latest match reports, club updates, and community stories from the Stadli Storm.",
                },
        ];
}

export function loader() {
        const articles = [...getNewsArticles()].sort(
                (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
        );

        return { articles };
}

export default function News({ loaderData }: Route.ComponentProps) {
        const { articles } = loaderData;

        return (
                <div className="bg-slate-950 text-slate-50">
                        <section className="border-b border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-900">
                                <div className="mx-auto max-w-6xl px-4 py-16">
                                        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Newsroom</p>
                                        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Storm Dispatch</h1>
                                        <p className="mt-4 max-w-3xl text-base text-blue-100">
                                                Match reports, academy breakthroughs, and exclusive interviews covering everything inside the Storm organization.
                                        </p>
                                </div>
                        </section>

                        <section className="mx-auto max-w-6xl px-4 py-16">
                                <div className="grid gap-10 md:grid-cols-[2fr,1fr]">
                                        <div className="space-y-10">
                                                {articles.map((article) => (
                                                        <article key={article.slug} className="rounded-3xl border border-slate-800 bg-slate-900/70">
                                                                <div
                                                                        className="h-64 w-full rounded-t-3xl bg-cover bg-center"
                                                                        style={{ backgroundImage: `url(${article.imageUrl})` }}
                                                                />
                                                                <div className="p-8">
                                                                        <p className="text-xs uppercase tracking-[0.3em] text-blue-300">
                                                                                {article.category}
                                                                        </p>
                                                                        <h2 className="mt-3 text-3xl font-semibold text-white">{article.title}</h2>
                                                                        <p className="mt-4 text-sm text-blue-100">{article.summary}</p>
                                                                        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-blue-300">
                                                                                {new Date(article.publishedAt).toLocaleString(undefined, {
                                                                                        month: "long",
                                                                                        day: "numeric",
                                                                                        year: "numeric",
                                                                                })}
                                                                                {" • "}
                                                                                {article.author}
                                                                        </p>
                                                                        <Link
                                                                                to={`/news/${article.slug}`}
                                                                                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-white"
                                                                        >
                                                                                Read full story →
                                                                        </Link>
                                                                </div>
                                                        </article>
                                                ))}
                                        </div>
                                        <aside className="space-y-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                                                <h2 className="text-lg font-semibold text-white">Top Stories</h2>
                                                <ol className="space-y-6 text-sm text-blue-100">
                                                        {articles.slice(0, 5).map((article, index) => (
                                                                <li key={article.slug} className="flex gap-4">
                                                                        <span className="text-xl font-semibold text-blue-400">{index + 1}</span>
                                                                        <div>
                                                                                <p className="font-semibold text-white">{article.title}</p>
                                                                                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-blue-300">
                                                                                        {new Date(article.publishedAt).toLocaleDateString()}
                                                                                </p>
                                                                        </div>
                                                                </li>
                                                        ))}
                                                </ol>
                                                <div className="rounded-2xl border border-blue-500/40 bg-slate-950/70 p-6 text-sm text-blue-100">
                                                        <h3 className="text-lg font-semibold text-white">Press Inquiries</h3>
                                                        <p className="mt-3">
                                                                Media members can request credentials or interviews via press@stadlistorm.ch. We respond within two business days.
                                                        </p>
                                                </div>
                                        </aside>
                                </div>
                        </section>
                </div>
        );
}
