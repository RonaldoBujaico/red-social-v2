import dotenv from "dotenv";
dotenv.config();
import "reflect-metadata";
import { DataSource } from "typeorm";
const isProd = process.env.NODE_ENV === "production";
export const AppDataSource = new DataSource({
    type: "mssql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 1433,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    synchronize: true,

    entities: [
        isProd ? __dirname + "/entities/**/*.js" : "src/entities/**/*.ts",
    ],

    migrations: [
        isProd ? __dirname + "/migrations/*.js" : "src/migrations/*.ts",
    ],

    dropSchema: false,
    logging: false,

    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
});
