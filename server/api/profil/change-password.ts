import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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
    const passwordUser = user.password;

    const { newPassword, oldPassword } = await readBody(event);
    if (!newPassword || !oldPassword) {
      setResponseStatus(event, 400);
      return {
        message:
          "Veuillez remplir tous les champs pour modifier le mot de passe",
      };
    }
    if (newPassword == oldPassword) {
      setResponseStatus(event, 400);
      return {
        message:
          "Veuillez saisir un nouveau mot de passe différent de l'ancien",
      };
    }

    const comparePassword = await bcrypt.compare(oldPassword, passwordUser);
    if (!comparePassword) {
      setResponseStatus(event, 401);
      return {
        message: "Mot de passe incorrect",
      };
    }

    if (newPassword.length < 4) {
      setResponseStatus(event, 400);
      return {
        message: "Le mot de passe doit contenir au moins 4 caractères",
      };
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        password: hash,
      },
    });

    setResponseStatus(event, 200);
    return {
      message: "Mot de passe modifié avec succès",
    };
  }
});
