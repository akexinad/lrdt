declare namespace NodeJS {
    export interface ProcessEnv {
        DB_URL: string;
        DB_NAME: string;
        DB_USER: string;
        DB_PASS: string;
        REDIS_URL: string;
        PORT: number;
        SESSION_SECRET: string;
        CORS_ORIGIN: string;
    }
}
