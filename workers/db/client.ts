import type { D1Database } from "@cloudflare/workers-types";

export type QueryResultRow = Record<string, unknown>;

export type QueryOptions = {
        params?: unknown[];
};

export class StadliDbClient {
        constructor(private readonly binding: D1Database) {}

        get raw() {
                return this.binding;
        }

        async run(query: string, params: unknown[] = []) {
                const statement = this.binding.prepare(query);
                const bound = params.length > 0 ? statement.bind(...params) : statement;

                await bound.run();
        }

        async all<T extends QueryResultRow = QueryResultRow>(query: string, params: unknown[] = []) {
                const statement = this.binding.prepare(query);
                const bound = params.length > 0 ? statement.bind(...params) : statement;
                const result = await bound.all<T>();

                return (result.results ?? []) as T[];
        }

        async get<T extends QueryResultRow = QueryResultRow>(query: string, params: unknown[] = []) {
                const statement = this.binding.prepare(query);
                const bound = params.length > 0 ? statement.bind(...params) : statement;
                const result = await bound.first<T>();

                return (result ?? null) as T | null;
        }
}

const clientCache = new WeakMap<D1Database, StadliDbClient>();

export function getDb(binding: D1Database) {
        if (!binding) {
                throw new Error("A valid D1 database binding is required to create a Stadli DB client");
        }

        const cached = clientCache.get(binding);

        if (cached) {
                return cached;
        }

        const client = new StadliDbClient(binding);
        clientCache.set(binding, client);

        return client;
}

export type StadliDb = ReturnType<typeof getDb>;
