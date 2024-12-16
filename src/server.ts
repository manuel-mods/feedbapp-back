import Fastify from "fastify";
import prismaPlugin from "./plugins/prisma";
import ordersRoutes from "./routes/feedback";
import cors from "@fastify/cors";
import { env } from "process";

const server = Fastify();

server.register(cors);
server.register(prismaPlugin);
server.register(ordersRoutes, { prefix: "/api/feedback" });

server.get("/", async () => {
  return { message: "Fastify API is running!" };
});

server.setErrorHandler((error, request, reply) => {
  console.error(error);
  reply.status(500).send({ error: "Internal Server Error" });
});

const start = async () => {
  try {
    const port = parseInt(env.port ?? "8080");
    await server.listen({
      port: port,
      host: "0.0.0.0",
    });
    console.log("Server is running at http://localhost:" + port);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
