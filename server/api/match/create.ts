import { PrismaClient } from "@prisma/client";
import { H3Event } from "h3";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET as string;

interface DecodedToken {
  id: string;
}

interface MatchBody {
  equipe1: string[];
  equipe2: string[];
  scoreEquipe1: number;
  scoreEquipe2: number;
}

export default defineEventHandler(async (event: H3Event) => {
  if (event.node.req.method === "POST") {
    const authHeader = event.node.req.headers.authorization;
    if (!authHeader) {
      setResponseStatus(event, 401);
      return {
        error: "Authorization header missing",
      };
    }

    const token = authHeader.split(" ")[1];

    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, jwtSecret) as DecodedToken;
    } catch (error) {
      setResponseStatus(event, 401);
      return {
        error: "Le token n'est pas valide",
      };
    }

    const { equipe1, equipe2, scoreEquipe1, scoreEquipe2 } =
      await readBody<MatchBody>(event);

    if (!equipe1 || !equipe2 || scoreEquipe1 == null || scoreEquipe2 == null) {
      setResponseStatus(event, 400);
      return {
        error: "Il manque des informations",
      };
    }

    try {
      const equipe1Users = await prisma.user.findMany({
        where: {
          username: {
            in: equipe1,
          },
        },
      });

      const equipe2Users = await prisma.user.findMany({
        where: {
          username: {
            in: equipe2,
          },
        },
      });

      if (
        equipe1Users.length !== equipe1.length ||
        equipe2Users.length !== equipe2.length
      ) {
        setResponseStatus(event, 400);
        return {
          error: "Un ou plusieurs noms d'utilisateur sont invalides",
        };
      }
      const winner = scoreEquipe1 > scoreEquipe2 ? "EQUIPE1" : "EQUIPE2";
      const newMatch = await prisma.match.create({
        data: {
          equipe1: {
            create: equipe1Users.map((user) => ({
              user: {
                connect: { id: user.id },
              },
            })),
          },
          equipe2: {
            create: equipe2Users.map((user) => ({
              user: {
                connect: { id: user.id },
              },
            })),
          },
          winner,
          scoreEquipe1,
          scoreEquipe2,
          confirmations: {
            create: [],
          },
          estConfirme: false,
          date: new Date(),
        },
        include: {
          equipe1: true,
          equipe2: true,
        },
      });

      setResponseStatus(event, 201);
      return {
        message: "Match créé avec succès",
        match: newMatch,
      };
    } catch (error) {
      console.error(error);
      setResponseStatus(event, 500);
      return {
        error: "Erreur lors de la création du match",
      };
    }
  } else {
    setResponseStatus(event, 405);
    return {
      error: "Method not allowed",
    };
  }
});
