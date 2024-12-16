import { PrismaClient } from "@prisma/client";
import { FastifyInstance, FastifyPluginOptions } from "fastify";

const prisma = new PrismaClient();

export default async function (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  // Obtener feedback de un usuario
  fastify.post("/user", async (request, reply) => {
    try {
      const { email, name, description } = request.body as {
        email: string;
        name: string;
        description?: string;
      };

      if (!email || !name) {
        return reply.status(400).send({ error: "Email and name are required" });
      }

      const user = await prisma.user.upsert({
        where: { email },
        update: { name, description },
        create: { email, name, description },
      });

      return reply
        .status(200)
        .send({ message: "User created or updated successfully", user });
    } catch (error) {
      console.error("Error creating or updating user:", error);
      reply.status(500).send({ error: "Error creating or updating user" });
    }
  });

  fastify.get("/:userId", async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      const feedbacks = await prisma.feedback.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      if (!feedbacks.length) {
        return reply
          .status(404)
          .send({ error: "No feedback found for this user" });
      }

      return reply.status(200).send(feedbacks);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      reply.status(500).send({ error: "Error fetching feedback" });
    }
  });

  // Agregar feedback
  fastify.post("/", async (request, reply) => {
    try {
      const { userId, content, rating, givenBy } = request.body as {
        userId: string;
        content: string;
        rating: number;
        givenBy: string;
      };

      if (!userId || !content || !rating || !givenBy) {
        return reply.status(400).send({ error: "Missing required fields" });
      }

      if (rating < 1 || rating > 5) {
        return reply
          .status(400)
          .send({ error: "Rating must be between 1 and 5" });
      }

      const newFeedback = await prisma.feedback.create({
        data: {
          userId,
          content,
          rating,
          givenBy,
        },
      });

      return reply.status(201).send(newFeedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      reply.status(500).send({ error: "Error creating feedback" });
    }
  });

  // Eliminar feedback
  fastify.delete("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const feedback = await prisma.feedback.findUnique({
        where: { id },
      });

      if (!feedback) {
        return reply.status(404).send({ error: "Feedback not found" });
      }

      await prisma.feedback.delete({
        where: { id },
      });

      return reply
        .status(200)
        .send({ message: "Feedback deleted successfully" });
    } catch (error) {
      console.error("Error deleting feedback:", error);
      reply.status(500).send({ error: "Error deleting feedback" });
    }
  });
}
