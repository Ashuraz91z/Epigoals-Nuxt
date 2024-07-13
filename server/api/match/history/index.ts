import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const jwt_secret = process.env.JWT_SECRET as string;

export default defineEventHandler(async (event: any) => {
  if (event.node.req.method === "GET") {
    try {
      const authHeader = event.node.req.headers.authorization;
      if (!authHeader) {
        throw new Error("Authorization header missing");
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        throw new Error("Token missing");
      }

      const decoded = jwt.verify(token, jwt_secret) as { id: string };
      if (!decoded || !decoded.id) {
        throw new Error("Invalid token");
      }

      const userId = decoded.id;

      const userMatches = await prisma.match.findMany({
        where: {
          estConfirme: true,
          OR: [
            {
              equipe1: {
                some: {
                  userId: userId,
                },
              },
            },
            {
              equipe2: {
                some: {
                  userId: userId,
                },
              },
            },
          ],
        },
        select: {
          scoreEquipe1: true,
          scoreEquipe2: true,
          date: true,
          winner: true,
          equipe1: true,
          equipe2: true,
          confirmations: {
            select: {
              user: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
      });

      if (!userMatches) {
        throw new Error(
          "PB lors de la récupération des matchs de l'utilisateur"
        );
      } else if (userMatches.length === 0) {
        throw new Error("Aucun match trouvé");
      }
      return {
        userMatches,
      };
    } catch (error: string | any) {
      console.error(error);

      setResponseStatus(event, 401);
      return {
        error: error.message || "Le token n'est pas valide",
      };
    }
  } else {
    setResponseStatus(event, 405);
    return {
      error: "Method not allowed",
    };
  }
});
