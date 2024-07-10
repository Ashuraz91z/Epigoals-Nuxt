import { PrismaClient } from "@prisma/client";
import username from "../user/username";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  if (event.node.req.method === "GET") {
    const allMatchs = await prisma.match.findMany({
      include: {
        equipe1: true,
        equipe2: true,
        confirmations: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });
    return allMatchs;
  }
});
