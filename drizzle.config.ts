type DrizzleConfig = {
        schema: string;
        out: string;
        dialect: "sqlite";
        driver: "d1";
        dbCredentials: {
                bindingName: string;
        };
};

const config: DrizzleConfig = {
        schema: "./drizzle/schema.ts",
        out: "./drizzle/migrations",
        dialect: "sqlite",
        driver: "d1",
        dbCredentials: {
                bindingName: "stadlidb"
        }
};

export default config;
