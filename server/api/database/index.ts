import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  if (event.node.req.method === "GET") {
    try {
      const users = await prisma.user.findMany();
      setResponseStatus(event, 200);
      return {
        message: "Connected to the database successfully.",
        users,
      };
    } catch (error) {
      console.error("Error connecting to the database:", error);
      setResponseStatus(event, 500);
      return {
        message: "An error occurred while connecting to the database.",
        error,
      };
    } finally {
      await prisma.$disconnect();
    }
  }
});
