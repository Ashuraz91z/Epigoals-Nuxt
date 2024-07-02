import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET as string;

export default defineEventHandler(async (event) => {
  if (event.node.req.method === "DELETE") {
    const { password } = await readBody(event);
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
    const comparePassword = await bcrypt.compare(password, passwordUser);

    if (!comparePassword) {
      setResponseStatus(event, 401);
      return {
        message: "Mot de passe incorrect",
      };
    }
    await prisma.user.delete({
      where: {
        email,
      },
    });
    return {
      message: "Compte supprimé avec succès",
    };
  }
});
