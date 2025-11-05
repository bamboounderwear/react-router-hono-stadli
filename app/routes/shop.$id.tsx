import { useEffect, useRef } from "react";
import { Form, Link } from "react-router";

import type { Route } from "./+types/shop.$id";
import { getShopItem } from "../data/club";
import { useCart } from "../lib/cart-context";

type SubmissionResult =
        | { success: boolean; size?: string; color?: string; quantity?: number; error?: string }
        | undefined;

export function meta({ data }: Route.MetaArgs) {
        const item = data?.item;
        if (!item) {
                return [
                        { title: "Product not found • Stadli Storm" },
                        { name: "description", content: "The requested product is not available." },
                ];
        }

        return [
                { title: `${item.name} • Stadli Storm Shop` },
                { name: "description", content: item.description },
        ];
}

export function loader({ params }: Route.LoaderArgs) {
        const { id } = params;
        if (!id) {
                throw new Response("Not found", { status: 404 });
        }

        const item = getShopItem(id);
        if (!item) {
                throw new Response("Not found", { status: 404 });
        }

        return { item } as const;
}

export async function action({ request }: Route.ActionArgs) {
        const formData = await request.formData();
        const size = (formData.get("size") as string | null)?.trim();
        const color = (formData.get("color") as string | null)?.trim();
        const quantity = parseInt((formData.get("quantity") as string | null) || "1", 10);

        if (!size || !color) {
                return { success: false, error: "Please select a size and color." } as const;
        }

        if (Number.isNaN(quantity) || quantity < 1) {
                return { success: false, error: "Quantity must be at least one." } as const;
        }

        return { success: true, size, color, quantity } as const;
}

export default function ShopItemDetail({ loaderData, actionData }: Route.ComponentProps) {
        const { item } = loaderData;
        const submission = actionData as SubmissionResult;
        const { addItem } = useCart();
        const lastSubmissionRef = useRef<SubmissionResult>(undefined);

        useEffect(() => {
                if (!submission?.success) {
                        lastSubmissionRef.current = submission;
                        return;
                }

                if (lastSubmissionRef.current === submission) {
                        return;
                }

                addItem({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: submission.quantity ?? 1,
                        size: submission.size,
                        color: submission.color,
                });

                lastSubmissionRef.current = submission;
        }, [submission, addItem, item.id, item.name, item.price]);

        return (
                <div className="bg-slate-950 text-slate-50">
                        <section className="mx-auto max-w-5xl px-4 py-16">
                                <Link to="/shop" className="text-sm font-semibold text-blue-300 hover:text-white">
                                        ← Back to shop
                                </Link>
                                <div className="mt-10 grid gap-10 md:grid-cols-[1.2fr,1fr]">
                                        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
                                                <div className="h-96 bg-cover bg-center" style={{ backgroundImage: `url(${item.imageUrl})` }} />
                                        </div>
                                        <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-sm text-blue-100">
                                                <p className="text-xs uppercase tracking-[0.3em] text-blue-300">Storm Authentics</p>
                                                <h1 className="mt-3 text-3xl font-semibold text-white">{item.name}</h1>
                                                <p className="mt-4 text-base">{item.description}</p>
                                                <p className="mt-6 text-3xl font-bold text-blue-200">CHF {item.price.toFixed(0)}</p>
                                                <Form method="post" className="mt-8 space-y-6">
                                                        <div>
                                                                <label htmlFor="size" className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                                                                        Size
                                                                </label>
                                                                <select
                                                                        id="size"
                                                                        name="size"
                                                                        required
                                                                        className="mt-2 w-full rounded-2xl border border-blue-500/40 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none"
                                                                >
                                                                        <option value="">Select size</option>
                                                                        {item.sizes.map((size: string) => (
                                                                                <option key={size} value={size}>
                                                                                        {size}
                                                                                </option>
                                                                        ))}
                                                                </select>
                                                        </div>
                                                        <div>
                                                                <label htmlFor="color" className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                                                                        Color
                                                                </label>
                                                                <select
                                                                        id="color"
                                                                        name="color"
                                                                        required
                                                                        className="mt-2 w-full rounded-2xl border border-blue-500/40 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none"
                                                                >
                                                                        <option value="">Select color</option>
                                                                        {item.colors.map((color: string) => (
                                                                                <option key={color} value={color}>
                                                                                        {color}
                                                                                </option>
                                                                        ))}
                                                                </select>
                                                        </div>
                                                        <div>
                                                                <label htmlFor="quantity" className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                                                                        Quantity
                                                                </label>
                                                                <input
                                                                        id="quantity"
                                                                        name="quantity"
                                                                        type="number"
                                                                        min={1}
                                                                        defaultValue={1}
                                                                        className="mt-2 w-full rounded-2xl border border-blue-500/40 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-blue-400 focus:outline-none"
                                                                />
                                                        </div>
                                                        <button
                                                                type="submit"
                                                                className="inline-flex w-full items-center justify-center rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
                                                        >
                                                                Add to cart
                                                        </button>
                                                        <ul className="space-y-2 text-xs text-blue-200">
                                                                {item.details.map((detail: string) => (
                                                                        <li key={detail} className="flex items-start gap-2">
                                                                                <span className="mt-1 inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                                                                                <span>{detail}</span>
                                                                        </li>
                                                                ))}
                                                        </ul>
                                                        {submission?.success && (
                                                                <p className="text-xs text-blue-200">
                                                                        Added {submission.quantity} × {item.name} ({submission.size} / {submission.color}) to your cart.
                                                                </p>
                                                        )}
                                                        {submission && !submission.success && submission.error && (
                                                                <p className="text-xs text-red-300">{submission.error}</p>
                                                        )}
                                                </Form>
                                        </aside>
                                </div>
                        </section>
                </div>
        );
}
