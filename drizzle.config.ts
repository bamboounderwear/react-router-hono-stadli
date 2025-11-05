import type { Config } from "drizzle-kit";

const config: Config = {
        schema: "./drizzle/schema.ts",
        out: "./drizzle/migrations",
        dialect: "sqlite",
        driver: "d1",
        dbCredentials: {
                bindingName: "stadlidb"
        }
};

export default config;
