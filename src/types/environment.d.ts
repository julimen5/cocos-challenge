// biome-ignore lint/style/noNamespace:
declare namespace NodeJS {
	interface ProcessEnv {
		// General
		NODE_ENV: string;

		// Database
		DATABASE_URL: string;

		// Server
		PORT: string;
		HOST: string;
	}
}
