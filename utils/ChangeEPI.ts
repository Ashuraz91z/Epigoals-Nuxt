import { PrismaClient } from "@prisma/client";
import calculerAjustementEPI from "./MathEPI";

const prisma = new PrismaClient();

interface Player {
  user: {
    EPI: number;
    MMR: number;
  };
  userId: string;
}

interface Match {
  winner: string;
  equipe1: Player[];
  equipe2: Player[];
}

export async function changeEPI(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      equipe1: {
        include: {
          user: {
            select: {
              EPI: true,
              MMR: true,
            },
          },
        },
      },
      equipe2: {
        include: {
          user: {
            select: {
              EPI: true,
              MMR: true,
            },
          },
        },
      },
    },
  });

  if (!match) {
    return { error: "Match non trouvé" };
  }

  const updatePlayersEPI = async (equipe: Player[], winnerTeam: string) => {
    for (let joueur of equipe) {
      const winner = match.winner === winnerTeam ? 1 : 0;
      const newEPI = calculerAjustementEPI(
        joueur.user.EPI,
        joueur.user.MMR,
        winner
      );

      await prisma.user.update({
        where: { id: joueur.userId },
        data: { EPI: newEPI },
      });
    }
  };

  await Promise.all([
    updatePlayersEPI(match.equipe1, "EQUIPE1"),
    updatePlayersEPI(match.equipe2, "EQUIPE2"),
  ]);

  return { isOk: true, message: "EPI mis à jour" };
}
