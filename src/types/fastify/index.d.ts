import { PrismaClient } from "@prisma/client";
import { AuthenticatedUser } from "../authentication";

declare module "fastify" {
	interface FastifyInstance {
	}

	interface FastifyRequest {
		startTime: [number, number];
	}
}
