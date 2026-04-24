import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

import { env } from "../config/env.js";

export async function registerSwagger(app: FastifyInstance): Promise<void> {
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Post Like Queue API",
        description: "API para simulacao de likes em posts com processamento assincrono.",
        version: "1.0.0"
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`
        }
      ]
    }
  });

  await app.register(swaggerUi, {
    routePrefix: env.SWAGGER_ROUTE_PREFIX,
    uiConfig: {
      docExpansion: "list",
      deepLinking: false
    }
  });
}
