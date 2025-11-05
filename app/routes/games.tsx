import { Link } from "react-router";

import type { Route } from "./+types/games";
import { getGames } from "../data/club";

export function meta({}: Route.MetaArgs) {
        return [
                { title: "Stadli Storm • Schedule" },
                {
                        name: "description",
                        content: "See upcoming fixtures and match results for the Stadli Storm.",
                },
        ];
}

export function loader() {
        const games = getGames();
        const upcoming = games.filter((game) => game.status === "upcoming");
        const finals = games.filter((game) => game.status === "final");

        return { upcoming, finals };
}

export default function Games({ loaderData }: Route.ComponentProps) {
        const { upcoming, finals } = loaderData;

        return (
                <div className="bg-slate-950 text-slate-50">
                        <section className="border-b border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-900">
                                <div className="mx-auto max-w-6xl px-4 py-16">
                                        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">2024 Fixtures</p>
                                        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Matchday Center</h1>
                                        <p className="mt-4 max-w-3xl text-base text-blue-100">
                                                Follow every clash in the alpine league. Reserve your seats, view match details, and relive recent performances.
                                        </p>
                                </div>
                        </section>

                        <section className="mx-auto max-w-6xl px-4 py-16">
                                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                                <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Next Up</p>
                                                <h2 className="text-3xl font-semibold text-white">Upcoming Matches</h2>
                                        </div>
                                        <p className="text-sm text-blue-200">Times listed in local Stadli time (CET).</p>
                                </header>
                                <div className="mt-10 grid gap-6 md:grid-cols-2">
                                        {upcoming.map((game) => (
                                                <article
                                                        key={game.id}
                                                        className="flex h-full flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg"
                                                >
                                                        <div>
                                                                <p className="text-xs uppercase tracking-[0.3em] text-blue-300">
                                                                        {game.isHome ? "Home" : "Away"} • {new Date(game.date).toLocaleDateString(undefined, {
                                                                                weekday: "long",
                                                                                month: "long",
                                                                                day: "numeric",
                                                                        })}
                                                                </p>
                                                                <h3 className="mt-4 text-2xl font-semibold text-white">Stadli Storm vs. {game.opponent}</h3>
                                                                <p className="mt-2 text-sm text-blue-100">{game.venue}</p>
                                                                <ul className="mt-6 space-y-3 text-sm text-blue-100">
                                                                        {game.highlights.map((highlight) => (
                                                                                <li key={highlight} className="flex items-start gap-3">
                                                                                        <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-blue-400" />
                                                                                        <span>{highlight}</span>
                                                                                </li>
                                                                        ))}
                                                                </ul>
                                                        </div>
                                                        <Link
                                                                to={`/games/${game.id}`}
                                                                className="mt-8 inline-flex items-center justify-center rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-400"
                                                        >
                                                                Match details →
                                                        </Link>
                                                </article>
                                        ))}
                                </div>
                        </section>

                        <section className="bg-slate-900/60">
                                <div className="mx-auto max-w-6xl px-4 py-16">
                                        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Recent Results</p>
                                        <h2 className="text-3xl font-semibold text-white">Final Scores & Recaps</h2>
                                        <div className="mt-10 grid gap-6 md:grid-cols-2">
                                                {finals.map((game) => (
                                                        <article key={game.id} className="rounded-3xl border border-slate-800 bg-slate-950/60">
                                                                <div
                                                                        className="h-48 rounded-t-3xl bg-cover bg-center"
                                                                        style={{ backgroundImage: `url(${game.heroImage})` }}
                                                                />
                                                                <div className="p-6">
                                                                        <p className="text-xs uppercase tracking-[0.3em] text-blue-300">Final Score</p>
                                                                        <h3 className="mt-3 text-2xl font-semibold text-white">{game.score}</h3>
                                                                        <p className="mt-2 text-sm text-blue-100">vs. {game.opponent} • {game.venue}</p>
                                                                        <p className="mt-4 text-sm text-blue-100">{game.recap}</p>
                                                                        <Link
                                                                                to={`/games/${game.id}`}
                                                                                className="mt-6 inline-flex text-sm font-semibold text-blue-300 hover:text-white"
                                                                        >
                                                                                Watch highlights →
                                                                        </Link>
                                                                </div>
                                                        </article>
                                                ))}
                                        </div>
                                </div>
                        </section>
                </div>
        );
}
