declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    SECRET: string;
    PORT: string;
    CORS_ORIGIN: string;
    STREAM_ORIGIN: string;
    LOCAL_CORS_ORIGIN: string;
  }
}