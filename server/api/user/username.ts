import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  if (event.node.req.method === "GET") {
    const allUsernames = await prisma.user.findMany({
      select: {
        username: true,
      },
    });

    const usernamesArray = allUsernames.map((user) => user.username);

    setResponseStatus(event, 200);
    return {
      usernames: usernamesArray,
    };
  }
});
