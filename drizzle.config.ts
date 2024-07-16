// ** Drizzle Imports
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/database/drizzle/schema/**",
    out: './drizzle',
    migrations: {
        table: 'migrations',
        schema: 'public',
    },
    dbCredentials: {
        url: process.env.DATABASE_URL_DRIZZLE!
    }
});
