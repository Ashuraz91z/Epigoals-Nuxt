import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";

const jwt_secret = process.env.JWT_SECRET as string;

export default defineEventHandler(async (event) => {
  if (event.node.req.method === "DELETE") {
    try {
      const authHeader = event.node.req.headers.authorization;
      if (!authHeader) {
        throw new Error("Authorization header missing");
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        throw new Error("Token missing");
      }

      // Vérifiez et décodez le token JWT
      const decoded = jwt.verify(token, jwt_secret);
      if (!decoded) {
        throw new Error("Invalid token");
      }
    } catch (error) {
      setResponseStatus(event, 401);
      return {
        error: "Le token n'est pas valide",
      };
    }

    try {
      const { matchId } = await readBody(event);

      await prisma.equipe1.deleteMany({
        where: {
          matchId: matchId,
        },
      });

      await prisma.equipe2.deleteMany({
        where: {
          matchId: matchId,
        },
      });

      await prisma.confirmation.deleteMany({
        where: {
          matchId: matchId,
        },
      });

      const match = await prisma.match.delete({
        where: {
          id: matchId,
        },
      });

      setResponseStatus(event, 200);
      return {
        message: "Match supprimé",
        match,
      };
    } catch (error) {
      setResponseStatus(event, 400);
      return {
        error: "Match non trouvé ou une erreur s'est produite",
      };
    }
  } else {
    setResponseStatus(event, 405); // Method Not Allowed
    return {
      error: "Method not allowed",
    };
  }
});
