import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcrypt";
import isValidEmail from "~/utils/RegexMail";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET as string;

export default defineEventHandler(async (event) => {
  if (event.node.req.method === "POST") {
    try {
      const { email, password, confirmPassword, username } = await readBody(
        event
      );

      // Verification Email et Username defined
      if (!email || !username) {
        setResponseStatus(event, 400);
        return {
          message: "Email et username sont requis",
        };
      }

      // Verification Email
      if (!isValidEmail(email)) {
        setResponseStatus(event, 400);
        return {
          message: "Email invalide",
        };
      }

      // Verification Password
      if (password.length < 4) {
        setResponseStatus(event, 400);
        return {
          message: "Le mot de passe doit contenir au moins 4 caractères",
        };
      } else if (password !== confirmPassword) {
        setResponseStatus(event, 400);
        return {
          message: "Les mots de passe ne correspondent pas",
        };
      }

      // Verification email et username unique
      const verifyUnique = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });
      if (verifyUnique) {
        setResponseStatus(event, 400);
        return {
          message: "Email ou username déjà utilisé",
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Creation user

      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          username,
          password: hashedPassword,
        },
      });
      const { id } = user;
      const token = jwt.sign({ email, username, id }, secret, {
        expiresIn: "7d",
      }); // 7 jours

      setResponseStatus(event, 201);
      return {
        message: "Utilisateur créé avec succès",
        token,
      };
    } catch (error: any) {
      console.error("Error creating user:", error);
      setResponseStatus(event, 500);
      return {
        message:
          "Un problème est survenu lors de la création de l'utilisateur, veuillez réessayer plus tard",
        error: error.message,
      };
    }
  } else {
    setResponseStatus(event, 405); // Method Not Allowed
    return {
      message: "Méthode non autorisée",
    };
  }
});
