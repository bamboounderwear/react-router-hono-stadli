import { Link } from "react-router";

import type { Route } from "./+types/home";
import {
        getGames,
        getNewsArticles,
        getShopItems,
        getTeamProfile,
} from "../data/club";

export function meta({}: Route.MetaArgs) {
        return [
                { title: "Stadli Storm" },
                {
                        name: "description",
                        content: "Follow the Stadli Storm for news, fixtures, roster insights, and official merchandise.",
                },
        ];
}

export function loader({ context }: Route.LoaderArgs) {
        const envMessage =
                (context.cloudflare as { env?: { VALUE_FROM_CLOUDFLARE?: string } } | undefined)?.env?.VALUE_FROM_CLOUDFLARE ??
                "Together we rise.";
        const profile = getTeamProfile();
        const games = getGames();
        const upcoming = games.find((game) => game.status === "upcoming") ?? games[0];
        const latestNews = getNewsArticles()
                .slice(0, 3)
                .map((article) => ({
                        slug: article.slug,
                        title: article.title,
                        summary: article.summary,
                        publishedAt: article.publishedAt,
                }));
        const featuredProduct = getShopItems()[0];

        return {
                envMessage,
                profile,
                upcoming,
                latestNews,
                featuredProduct,
        };
}

export default function Home({ loaderData }: Route.ComponentProps) {
        const { envMessage, profile, upcoming, latestNews, featuredProduct } = loaderData;

        return (
                <div className="min-h-screen bg-slate-950 text-white">
                        <section className="relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-slate-900 to-slate-950" />
                                <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 md:flex-row md:items-center">
                                        <div className="md:w-3/5">
                                                <p className="uppercase tracking-[0.3em] text-sm text-blue-200">{profile.city}</p>
                                                <h1 className="mt-4 text-4xl font-bold sm:text-5xl lg:text-6xl">{profile.name}</h1>
                                                <p className="mt-6 max-w-xl text-lg text-blue-100">{profile.tagline}</p>
                                                <dl className="mt-8 grid grid-cols-2 gap-6 text-sm sm:grid-cols-4">
                                                        <div>
                                                                <dt className="text-blue-200">Record</dt>
                                                                <dd className="mt-1 text-2xl font-semibold">{profile.record}</dd>
                                                        </div>
                                                        <div>
                                                                <dt className="text-blue-200">Arena</dt>
                                                                <dd className="mt-1 font-medium">{profile.arena}</dd>
                                                        </div>
                                                        <div>
                                                                <dt className="text-blue-200">Founded</dt>
                                                                <dd className="mt-1 font-medium">{profile.founded}</dd>
                                                        </div>
                                                        <div>
                                                                <dt className="text-blue-200">Club Colors</dt>
                                                                <dd className="mt-1 font-medium">{profile.colors.join(", ")}</dd>
                                                        </div>
                                                </dl>
                                                <div className="mt-10 flex flex-wrap gap-4">
                                                        <Link
                                                                to="/games"
                                                                className="rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-400"
                                                        >
                                                                View Schedule
                                                        </Link>
                                                        <Link
                                                                to="/team"
                                                                className="rounded-full border border-blue-200 px-6 py-3 text-sm font-semibold text-blue-200 transition hover:border-white hover:text-white"
                                                        >
                                                                Meet the Squad
                                                        </Link>
                                                </div>
                                        </div>
                                        <div className="md:w-2/5">
                                                <div className="rounded-3xl border border-blue-500/40 bg-slate-900/60 p-6 shadow-2xl backdrop-blur">
                                                        <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Next Fixture</p>
                                                        <h2 className="mt-4 text-2xl font-semibold text-white">vs. {upcoming.opponent}</h2>
                                                        <p className="mt-2 text-sm text-blue-200">
                                                                {new Date(upcoming.date).toLocaleDateString(undefined, {
                                                                        weekday: "short",
                                                                        month: "short",
                                                                        day: "numeric",
                                                                })}
                                                                {" • "}
                                                                {upcoming.venue}
                                                        </p>
                                                        <ul className="mt-6 space-y-3 text-sm text-blue-100">
                                                                {upcoming.highlights.map((highlight) => (
                                                                        <li key={highlight} className="flex items-start gap-3">
                                                                                <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-blue-400" />
                                                                                <span>{highlight}</span>
                                                                        </li>
                                                                ))}
                                                        </ul>
                                                        <Link
                                                                to={`/games/${upcoming.id}`}
                                                                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-blue-100"
                                                        >
                                                                Match Center →
                                                        </Link>
                                                </div>
                                        </div>
                                </div>
                        </section>

                        <section className="mx-auto max-w-6xl px-4 py-16">
                                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                                <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Latest Headlines</p>
                                                <h2 className="mt-2 text-3xl font-semibold">Storm Newsroom</h2>
                                        </div>
                                        <Link to="/news" className="text-sm font-semibold text-blue-300 hover:text-white">
                                                Browse all news →
                                        </Link>
                                </header>
                                <div className="mt-10 grid gap-8 md:grid-cols-3">
                                        {latestNews.map((article) => (
                                                <article
                                                        key={article.slug}
                                                        className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg transition hover:border-blue-500/60 hover:shadow-blue-500/20"
                                                >
                                                        <p className="text-xs uppercase tracking-[0.25em] text-blue-300">
                                                                {new Date(article.publishedAt).toLocaleDateString(undefined, {
                                                                        month: "short",
                                                                        day: "numeric",
                                                                })}
                                                        </p>
                                                        <h3 className="mt-4 text-xl font-semibold text-white">{article.title}</h3>
                                                        <p className="mt-3 text-sm text-blue-100">{article.summary}</p>
                                                        <Link to={`/news/${article.slug}`} className="mt-6 inline-flex text-sm font-semibold text-blue-300 hover:text-white">
                                                                Read story →
                                                        </Link>
                                                </article>
                                        ))}
                                </div>
                        </section>

                        <section className="bg-slate-900/80">
                                <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 md:flex-row md:items-center">
                                        <div className="md:w-1/2">
                                                <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Official Store</p>
                                                <h2 className="mt-3 text-3xl font-semibold text-white">Featured Merchandise</h2>
                                                <p className="mt-4 text-sm text-blue-100">
                                                        Gear up with the latest Storm apparel direct from the locker room. Every purchase supports the Future Academy.
                                                </p>
                                                <Link
                                                        to={`/shop/${featuredProduct.id}`}
                                                        className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-400"
                                                >
                                                        Shop now →
                                                </Link>
                                        </div>
                                        <div className="md:w-1/2">
                                                <div className="overflow-hidden rounded-3xl border border-blue-500/40 bg-slate-950/70 shadow-2xl">
                                                        <div
                                                                className="h-56 bg-cover bg-center"
                                                                style={{ backgroundImage: `url(${featuredProduct.imageUrl})` }}
                                                        />
                                                        <div className="p-6">
                                                                {featuredProduct.badge && (
                                                                        <span className="inline-flex rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-200">
                                                                                {featuredProduct.badge}
                                                                        </span>
                                                                )}
                                                                <h3 className="mt-4 text-2xl font-semibold text-white">{featuredProduct.name}</h3>
                                                                <p className="mt-2 text-sm text-blue-100">{featuredProduct.description}</p>
                                                                <p className="mt-4 text-lg font-semibold text-blue-200">CHF {featuredProduct.price.toFixed(0)}</p>
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        </section>

                        <section className="border-t border-slate-800 bg-slate-950">
                                <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-center text-xs text-blue-200 sm:flex-row sm:items-center sm:justify-between">
                                        <p>Powered by the Storm network • {envMessage}</p>
                                        <div className="flex justify-center gap-6 text-blue-300">
                                                <Link to="/team" className="hover:text-white">
                                                        Squad
                                                </Link>
                                                <Link to="/games" className="hover:text-white">
                                                        Schedule
                                                </Link>
                                                <Link to="/shop" className="hover:text-white">
                                                        Shop
                                                </Link>
                                        </div>
                                </div>
                        </section>
                </div>
        );
}
