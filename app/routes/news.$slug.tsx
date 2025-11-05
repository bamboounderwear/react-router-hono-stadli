import { Link } from "react-router";

import type { Route } from "./+types/news.$slug";

type PublicArticle = {
        slug: string;
        title: string;
        summary: string;
        content: string;
        category: string;
        publishedAt: number;
        imageUrl: string;
        author: string;
};

export function meta({ data }: Route.MetaArgs) {
        const article = data?.article;
        if (!article) {
                return [
                        { title: "Article not found • Stadli Storm" },
                        { name: "description", content: "The requested article could not be located." },
                ];
        }

        return [
                { title: `${article.title} • Stadli Storm News` },
                { name: "description", content: article.summary },
        ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
        const { slug } = params;
        if (!slug) {
                throw new Response("Not found", { status: 404 });
        }

        const response = await fetch(new URL(`/api/public/news/${slug}`, request.url).toString());

        if (response.status === 404) {
                throw new Response("Not found", { status: 404 });
        }

        if (!response.ok) {
                throw new Response("Failed to load article", { status: response.status });
        }

        const payload = (await response.json()) as { article: PublicArticle };

        return {
                article: {
                        ...payload.article,
                        publishedAt: new Date(payload.article.publishedAt).toISOString(),
                },
        } as const;
}

export default function NewsArticle({ loaderData }: Route.ComponentProps) {
        const { article } = loaderData as { article: Omit<PublicArticle, "publishedAt"> & { publishedAt: string } };
        const fallbackImage = "https://images.unsplash.com/photo-1522770179533-24471fcdba45?auto=format&fit=crop&w=1400&q=80";

        return (
                <div className="bg-slate-950 text-slate-50">
                        <div className="relative">
                                <div
                                        className="absolute inset-0 h-96 bg-cover bg-center opacity-40"
                                        style={{ backgroundImage: `url(${article.imageUrl || fallbackImage})` }}
                                />
                                <div className="relative mx-auto max-w-4xl px-4 pt-24 pb-16 text-center">
                                        <p className="text-xs uppercase tracking-[0.3em] text-blue-200">{article.category}</p>
                                        <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">{article.title}</h1>
                                        <p className="mt-6 text-sm uppercase tracking-[0.2em] text-blue-200">
                                                {new Date(article.publishedAt).toLocaleString(undefined, {
                                                        month: "long",
                                                        day: "numeric",
                                                        year: "numeric",
                                                })}
                                                {" • "}
                                                {article.author}
                                        </p>
                                </div>
                        </div>

                        <article className="mx-auto max-w-3xl space-y-8 px-4 pb-16 text-lg leading-relaxed text-blue-100">
                                {article.content.split("\n\n").map((paragraph: string) => (
                                        <p key={paragraph}>{paragraph}</p>
                                ))}
                                <div className="rounded-3xl border border-blue-500/30 bg-slate-900/60 p-6 text-sm text-blue-100">
                                        <h2 className="text-lg font-semibold text-white">Share your thoughts</h2>
                                        <p className="mt-3">
                                                Tag @StadliStorm with #TempestTakes to have your reactions featured in our matchday program.
                                        </p>
                                </div>
                                <Link
                                        to="/news"
                                        className="inline-flex items-center gap-2 rounded-full border border-blue-300 px-5 py-2 text-sm font-semibold text-blue-200 transition hover:border-white hover:text-white"
                                >
                                        ← Back to all news
                                </Link>
                        </article>
                </div>
        );
}
