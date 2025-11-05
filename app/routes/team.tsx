import { Form } from "react-router";

import type { Route } from "./+types/team";
import { getGallery, getRoster, getStaff, getTeamProfile } from "../data/club";

export function meta({}: Route.MetaArgs) {
        return [
                { title: "Stadli Storm • Team" },
                {
                        name: "description",
                        content: "Meet the Stadli Storm roster, coaching staff, and club programs.",
                },
        ];
}

export function loader() {
        return {
                profile: getTeamProfile(),
                roster: getRoster(),
                staff: getStaff(),
                gallery: getGallery(),
        };
}

export async function action({ request }: Route.ActionArgs) {
        const formData = await request.formData();
        const name = (formData.get("name") as string | null)?.trim();
        const email = (formData.get("email") as string | null)?.trim();
        const interest = (formData.get("interest") as string | null)?.trim();

        if (!name || !email) {
                return {
                        success: false,
                        error: "Please add your name and email so we can respond to you.",
                } as const;
        }

        return {
                success: true,
                name,
                interest: interest || "General Inquiry",
        } as const;
}

export default function Team({ loaderData, actionData }: Route.ComponentProps) {
        const { profile, roster, staff, gallery } = loaderData;
        const submission = actionData as { success: boolean; name?: string; error?: string; interest?: string } | undefined;

        return (
                <div className="bg-slate-950 text-slate-50">
                        <section className="border-b border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950">
                                <div className="mx-auto max-w-6xl px-4 py-16">
                                        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Club DNA</p>
                                        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Meet the {profile.name}</h1>
                                        <p className="mt-4 max-w-3xl text-base text-blue-100">
                                                {profile.name} compete out of {profile.arena} in {profile.city}. Founded in {profile.founded}, the club embraces the alpine
                                                identity with colors {profile.colors.join(", ")} and the mantra "{profile.tagline}"
                                        </p>
                                        <dl className="mt-10 grid gap-6 rounded-3xl border border-blue-500/30 bg-slate-900/70 p-6 text-sm sm:grid-cols-4">
                                                <div>
                                                        <dt className="text-blue-200">Current Record</dt>
                                                        <dd className="mt-1 text-2xl font-semibold text-white">{profile.record}</dd>
                                                </div>
                                                <div>
                                                        <dt className="text-blue-200">Arena</dt>
                                                        <dd className="mt-1 font-medium">{profile.arena}</dd>
                                                </div>
                                                <div>
                                                        <dt className="text-blue-200">Supporters</dt>
                                                        <dd className="mt-1 font-medium">Tempest • 9,300 members</dd>
                                                </div>
                                                <div>
                                                        <dt className="text-blue-200">Community Programs</dt>
                                                        <dd className="mt-1 font-medium">Future Academy • Alpine Clinics</dd>
                                                </div>
                                        </dl>
                                </div>
                        </section>

                        <section className="mx-auto max-w-6xl px-4 py-16">
                                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                                <p className="text-sm uppercase tracking-[0.3em] text-blue-300">First Team</p>
                                                <h2 className="text-3xl font-semibold text-white">The Matchday Squad</h2>
                                        </div>
                                        <p className="text-sm text-blue-200">Statistics shown reflect all competitions this season.</p>
                                </header>
                                <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                        {roster.map((player) => (
                                                <article
                                                        key={player.id}
                                                        className="flex h-full flex-col rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-blue-500/10"
                                                >
                                                        <header className="flex items-baseline justify-between">
                                                                <p className="text-4xl font-bold text-blue-400">#{player.number}</p>
                                                                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-200">
                                                                        {player.position}
                                                                </span>
                                                        </header>
                                                        <h3 className="mt-4 text-2xl font-semibold text-white">{player.name}</h3>
                                                        <p className="mt-2 text-sm text-blue-100">{player.bio}</p>
                                                        <dl className="mt-6 grid grid-cols-3 gap-3 text-center text-xs">
                                                                <div className="rounded-2xl bg-slate-950/60 p-3">
                                                                        <dt className="text-blue-200">Games</dt>
                                                                        <dd className="mt-1 text-lg font-semibold text-white">{player.stats.games}</dd>
                                                                </div>
                                                                <div className="rounded-2xl bg-slate-950/60 p-3">
                                                                        <dt className="text-blue-200">Goals</dt>
                                                                        <dd className="mt-1 text-lg font-semibold text-white">{player.stats.goals}</dd>
                                                                </div>
                                                                <div className="rounded-2xl bg-slate-950/60 p-3">
                                                                        <dt className="text-blue-200">Assists</dt>
                                                                        <dd className="mt-1 text-lg font-semibold text-white">{player.stats.assists}</dd>
                                                                </div>
                                                        </dl>
                                                        <p className="mt-4 text-xs text-blue-200">Hometown: {player.hometown}</p>
                                                </article>
                                        ))}
                                </div>
                        </section>

                        <section className="bg-slate-900/60">
                                <div className="mx-auto max-w-6xl px-4 py-16">
                                        <h2 className="text-3xl font-semibold text-white">Coaching & Performance Staff</h2>
                                        <div className="mt-8 grid gap-6 md:grid-cols-3">
                                                {staff.map((member) => (
                                                        <article
                                                                key={member.id}
                                                                className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6"
                                                        >
                                                                <h3 className="text-xl font-semibold text-white">{member.name}</h3>
                                                                <p className="mt-2 text-sm uppercase tracking-[0.3em] text-blue-300">{member.role}</p>
                                                                <p className="mt-4 text-sm text-blue-100">{member.experience}</p>
                                                        </article>
                                                ))}
                                        </div>
                                </div>
                        </section>

                        <section className="mx-auto max-w-6xl px-4 py-16">
                                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                        <div>
                                                <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Inside the Storm</p>
                                                <h2 className="text-3xl font-semibold text-white">Gallery Highlights</h2>
                                        </div>
                                        <p className="text-sm text-blue-200">Captured moments from recent fixtures and community events.</p>
                                </header>
                                <div className="mt-10 grid gap-6 md:grid-cols-3">
                                        {gallery.map((item) => (
                                                <figure key={item.id} className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60">
                                                        <div className="h-56 bg-cover bg-center" style={{ backgroundImage: `url(${item.imageUrl})` }} />
                                                        <figcaption className="p-6">
                                                                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                                                                <p className="mt-2 text-sm text-blue-100">{item.description}</p>
                                                        </figcaption>
                                                </figure>
                                        ))}
                                </div>
                        </section>

                        <section className="bg-gradient-to-br from-blue-600/10 via-slate-950 to-slate-900">
                                <div className="mx-auto max-w-3xl px-4 py-16">
                                        <h2 className="text-3xl font-semibold text-white">Join the Tempest Supporters</h2>
                                        <p className="mt-4 text-sm text-blue-100">
                                                Become part of matchday choreographies, exclusive events, and volunteer programs. Fill out the form and our supporter
                                                liaison will follow up within two business days.
                                        </p>
                                        <Form method="post" className="mt-10 space-y-6">
                                                <div>
                                                        <label htmlFor="name" className="text-sm font-semibold text-blue-200">
                                                                Full Name
                                                        </label>
                                                        <input
                                                                id="name"
                                                                name="name"
                                                                type="text"
                                                                required
                                                                className="mt-2 w-full rounded-2xl border border-blue-500/40 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-blue-200/60 focus:border-blue-400 focus:outline-none"
                                                                placeholder="Ava Hart"
                                                        />
                                                </div>
                                                <div>
                                                        <label htmlFor="email" className="text-sm font-semibold text-blue-200">
                                                                Email
                                                        </label>
                                                        <input
                                                                id="email"
                                                                name="email"
                                                                type="email"
                                                                required
                                                                className="mt-2 w-full rounded-2xl border border-blue-500/40 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-blue-200/60 focus:border-blue-400 focus:outline-none"
                                                                placeholder="ava@example.com"
                                                        />
                                                </div>
                                                <div>
                                                        <label htmlFor="interest" className="text-sm font-semibold text-blue-200">
                                                                Tell us how you want to get involved
                                                        </label>
                                                        <textarea
                                                                id="interest"
                                                                name="interest"
                                                                rows={4}
                                                                className="mt-2 w-full rounded-2xl border border-blue-500/40 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-blue-200/60 focus:border-blue-400 focus:outline-none"
                                                                placeholder="Tifo design, away day travel, youth coaching..."
                                                        />
                                                </div>
                                                <button
                                                        type="submit"
                                                        className="inline-flex items-center justify-center rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
                                                >
                                                        Submit interest
                                                </button>
                                                {submission?.success && (
                                                        <p className="text-sm text-blue-200">
                                                                Thanks {submission.name}! Our liaison will reach out with Tempest details about {submission.interest}.
                                                        </p>
                                                )}
                                                {submission && !submission.success && submission.error && (
                                                        <p className="text-sm text-red-300">{submission.error}</p>
                                                )}
                                        </Form>
                                </div>
                        </section>
                </div>
        );
}
