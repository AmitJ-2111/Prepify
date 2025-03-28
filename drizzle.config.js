/** @type {import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: "postgresql",
    dbCredentials: {
        url: 'postgresql://neondb_owner:npg_baIDfC9tAgp0@ep-spring-truth-a4amndmy-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
    }
};