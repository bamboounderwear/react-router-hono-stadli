import { Form, Link } from "react-router";

import type { Route } from "./+types/games.$id";
import { getGame } from "../data/club";

export function meta({ data }: Route.MetaArgs) {
        const game = data?.game;
        if (!game) {
                return [
                        { title: "Match not found • Stadli Storm" },
                        { name: "description", content: "The requested match could not be located." },
                ];
        }

        const opponent = game.opponent;
        return [
                { title: `Stadli Storm vs. ${opponent}` },
                {
                        name: "description",
                        content:
                                game.status === "final"
                                        ? `Final score ${game.score} against ${opponent}.`
                                        : `Preview the upcoming clash with ${opponent}.`,
                },
        ];
}

export function loader({ params }: Route.LoaderArgs) {
        const { id } = params;
        if (!id) {
                throw new Response("Not found", { status: 404 });
        }

        const game = getGame(id);
        if (!game) {
                throw new Response("Not found", { status: 404 });
        }

        return { game } as const;
}

export async function action({ request }: Route.ActionArgs) {
        const formData = await request.formData();
        const name = (formData.get("name") as string | null)?.trim();
        const email = (formData.get("email") as string | null)?.trim();
        const seats = (formData.get("seats") as string | null)?.trim();

        if (!name || !email) {
                return {
                        success: false,
                        error: "Name and email are required.",
                } as const;
        }

        return {
                success: true,
                name,
                seats: seats || "2",
        } as const;
}

export default function GameDetail({ loaderData, actionData }: Route.ComponentProps) {
        const { game } = loaderData;
        const submission = actionData as { success: boolean; name?: string; seats?: string; error?: string } | undefined;

        return (
                <div className="bg-slate-950 text-slate-50">
                        <section className="relative overflow-hidden">
                                <div
                                        className="absolute inset-0 h-[420px] bg-cover bg-center opacity-30"
                                        style={{ backgroundImage: `url(${game.heroImage})` }}
                                />
                                <div className="relative mx-auto max-w-5xl px-4 pt-24 pb-16">
                                        <p className="text-xs uppercase tracking-[0.3em] text-blue-200">{game.status === "final" ? "Final Score" : "Upcoming Fixture"}</p>
                                        <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Stadli Storm vs. {game.opponent}</h1>
                                        <p className="mt-4 text-sm uppercase tracking-[0.2em] text-blue-200">
                                                {new Date(game.date).toLocaleString(undefined, {
                                                        weekday: "long",
                                                        month: "long",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                })}
                                                {" • "}
                                                {game.venue}
                                        </p>
                                        {game.status === "final" && game.score && (
                                                <p className="mt-6 text-5xl font-bold text-blue-200">{game.score}</p>
                                        )}
                                </div>
                        </section>

                        <section className="mx-auto max-w-5xl px-4 py-16">
                                <div className="grid gap-10 md:grid-cols-[2fr,1fr]">
                                        <article className="space-y-8 text-lg leading-relaxed text-blue-100">
                                                {game.status === "final" && game.recap ? (
                                                        <p>{game.recap}</p>
                                                ) : (
                                                        <p>
                                                                The Storm continue preparations with a focus on tempo control and set-piece creativity. Expect rotations across the front line as the
                                                                coaching staff manages minutes during a demanding stretch.
                                                        </p>
                                                )}
                                                <div className="rounded-3xl border border-blue-500/30 bg-slate-900/60 p-6 text-sm text-blue-100">
                                                        <h2 className="text-lg font-semibold text-white">Key Storylines</h2>
                                                        <ul className="mt-4 space-y-3">
                                                                {game.highlights.map((highlight: string) => (
                                                                        <li key={highlight} className="flex items-start gap-3">
                                                                                <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-blue-400" />
                                                                                <span>{highlight}</span>
                                                                        </li>
                                                                ))}
                                                        </ul>
                                                </div>
                                                <Link to="/games" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-white">
                                                        ← Back to schedule
                                                </Link>
                                        </article>
                                        <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-blue-100">
                                                <h2 className="text-lg font-semibold text-white">
                                                        {game.status === "final" ? "Match Archive" : "Reserve Seats"}
                                                </h2>
                                                {game.status === "final" ? (
                                                        <p className="mt-4">
                                                                Replays and condensed highlights will be available in the Storm app within 24 hours of the final whistle. Season ticket holders receive early
                                                                access.
                                                        </p>
                                                ) : (
                                                        <>
                                                                <p className="mt-4">Secure your spot in the Tempest supporters section before it sells out.</p>
                                                                <Form method="post" className="mt-6 space-y-4">
                                                                        <div>
                                                                                <label htmlFor="name" className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                                                                                        Name
                                                                                </label>
                                                                                <input
                                                                                        id="name"
                                                                                        name="name"
                                                                                        required
                                                                                        className="mt-2 w-full rounded-2xl border border-blue-500/40 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-blue-200/60 focus:border-blue-400 focus:outline-none"
                                                                                        placeholder="Supporter name"
                                                                                />
                                                                        </div>
                                                                        <div>
                                                                                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                                                                                        Email
                                                                                </label>
                                                                                <input
                                                                                        id="email"
                                                                                        name="email"
                                                                                        type="email"
                                                                                        required
                                                                                        className="mt-2 w-full rounded-2xl border border-blue-500/40 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-blue-200/60 focus:border-blue-400 focus:outline-none"
                                                                                        placeholder="you@example.com"
                                                                                />
                                                                        </div>
                                                                        <div>
                                                                                <label htmlFor="seats" className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                                                                                        Seats requested
                                                                                </label>
                                                                                <input
                                                                                        id="seats"
                                                                                        name="seats"
                                                                                        type="number"
                                                                                        min={1}
                                                                                        max={6}
                                                                                        className="mt-2 w-full rounded-2xl border border-blue-500/40 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-blue-200/60 focus:border-blue-400 focus:outline-none"
                                                                                        defaultValue={2}
                                                                                />
                                                                        </div>
                                                                        <button
                                                                                type="submit"
                                                                                className="inline-flex w-full items-center justify-center rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-400"
                                                                        >
                                                                                Request tickets
                                                                        </button>
                                                                        {submission?.success && (
                                                                                <p className="text-xs text-blue-200">
                                                                                        Thanks {submission.name}! A representative will contact you about {submission.seats} seats in the Tempest section.
                                                                                </p>
                                                                        )}
                                                                        {submission && !submission.success && submission.error && (
                                                                                <p className="text-xs text-red-300">{submission.error}</p>
                                                                        )}
                                                                </Form>
                                                        </>
                                                )}
                                        </aside>
                                </div>
                        </section>
                </div>
        );
}
