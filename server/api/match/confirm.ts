import { PrismaClient } from "@prisma/client";
import { H3Event } from "h3";
import jwt from "jsonwebtoken";
import { changeMMR } from "~/utils/ChangeMMR";
import { changeEPI } from "~/utils/ChangeEPI";

const prisma = new PrismaClient();
const jwt_secret = process.env.JWT_SECRET;

if (!jwt_secret) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

interface DecodedToken {
  id: string;
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
      decoded = jwt.verify(token, jwt_secret) as DecodedToken;
    } catch (error) {
      setResponseStatus(event, 401);
      return {
        error: "Le token n'est pas valide",
      };
    }

    const { matchId } = await readBody(event);
    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
      include: {
        equipe1: true,
        equipe2: true,
        confirmations: {
          include: {
            user: {
              select: {
                username: true, // usrname
              },
            },
          },
        },
      },
    });

    if (!match) {
      setResponseStatus(event, 404);
      return {
        error: "Match non trouvé",
      };
    }

    const id = decoded.id;
    const idUser = match.equipe1.map((joueur) => joueur.userId);
    idUser.push(...match.equipe2.map((joueur) => joueur.userId));

    if (!idUser.includes(id)) {
      setResponseStatus(event, 403);
      return {
        error: "Vous n'êtes pas autorisé à confirmer ce match",
      };
    }

    const userConfirmation = match.confirmations.find(
      (confirmation) => confirmation.userId === id
    );
    if (userConfirmation) {
      setResponseStatus(event, 400);
      return {
        error: "Vous avez déjà confirmé ce match",
      };
    }

    await prisma.confirmation.create({
      data: {
        userId: id,
        matchId: match.id,
      },
    });

    const updatedMatch = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
      include: {
        equipe1: true,
        equipe2: true,
        confirmations: {
          include: {
            user: {
              select: {
                username: true, // seuleemnt le username de l'utilisateur
              },
            },
          },
        },
      },
    });

    if (updatedMatch?.confirmations.length || 0 > 2) {
      const modifMMR = await changeMMR(matchId);
      if (modifMMR.isOk) {
        console.log("MMR modifié");
        const modifEPI = await changeEPI(matchId);
        if (modifEPI.isOk) {
          console.log("EPI modifié");
        }
      }
    }

    return updatedMatch;
  }

  if (event.node.req.method === "PUT") {
    const { matchId } = await readBody(event);
    const updatedMatch = await changeMMR(matchId);
    return updatedMatch;
  }
});
