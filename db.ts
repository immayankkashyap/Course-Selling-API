import { PrismaClient } from "./prisma/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const rawDatabaseUrl = process.env.DATABASE_URL;

if (!rawDatabaseUrl) {
	throw new Error("DATABASE_URL is not set");
}

const normalizedDatabaseUrl = (() => {
	const url = new URL(rawDatabaseUrl);
	const sslmode = url.searchParams.get("sslmode");

	if (sslmode === "prefer" || sslmode === "require" || sslmode === "verify-ca") {
		url.searchParams.set("sslmode", "verify-full");
	}

	return url.toString();
})();

const adapter = new PrismaPg({
connectionString: normalizedDatabaseUrl,
});

export const prisma = new PrismaClient({
adapter,
});