import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const Prisma = new PrismaClient();
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);
  if (!email || !password) {
    setResponseStatus(event, 400);
    return { message: "Veuillez remplir tous les champs" };
  }
  const user: any = await Prisma.user.findUnique({
    where: { email },
  });
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    setResponseStatus(event, 400);
    return { message: "Email ou mot de passe incorrect" };
  }

  const { username } = user;
  console.log("user", user);
  console.log("username", username);

  const token = jwt.sign({ email, username }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  setResponseStatus(event, 200);
  return { message: "Connexion réussie", token };
});
