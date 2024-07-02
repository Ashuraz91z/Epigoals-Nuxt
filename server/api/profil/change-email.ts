import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";
import isValidEmail from "~/utils/RegexMail";

const secret = process.env.JWT_SECRET as string;

export default defineEventHandler(async (event) => {
  if (event.node.req.method === "PUT") {
    const token = event.node.req.headers.authorization?.split(" ")[1] as string;
    const decoded = jwt.verify(token, secret);
    const email = (decoded as any).email;
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      setResponseStatus(event, 401);
      return {
        message: "Non autorisé",
      };
    }

    const { newEmail } = await readBody(event);

    const verifyUnique = await prisma.user.findFirst({
      where: {
        email: newEmail,
      },
    });

    if (verifyUnique) {
      setResponseStatus(event, 400);
      return {
        message: "Email déjà utilisé",
      };
    }

    if (!newEmail) {
      setResponseStatus(event, 400);
      return {
        message: "Veuillez remplir le champs email",
      };
    }
    if (!isValidEmail(newEmail)) {
      setResponseStatus(event, 400);
      return {
        message: "Veuillez saisir un email valide",
      };
    }

    if (newEmail == email) {
      setResponseStatus(event, 400);
      return {
        message: "Veuillez saisir un nouvel email différent de l'ancien",
      };
    }

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        email: newEmail,
      },
    });
    const newToken = jwt.sign({ email: newEmail }, secret, { expiresIn: "7d" });
    setResponseStatus(event, 200);
    return {
      message: "Mot de passe modifié avec succès",
      token: newToken,
    };
  }
});
