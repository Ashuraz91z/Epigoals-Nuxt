import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import MathMMR from "./MathMMR";

const coeffMMR = 30;

interface Player {
  user: {
    MMR: number;
  };
  userId: string;
}

interface Match {
  winner: string;
  scoreEquipe1: number;
  scoreEquipe2: number;
  equipe1: Player[];
  equipe2: Player[];
}

export async function changeMMR(matchId: string) {
  try {
    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
      include: {
        equipe1: {
          include: {
            user: {
              select: {
                MMR: true,
              },
            },
          },
        },
        equipe2: {
          include: {
            user: {
              select: {
                MMR: true,
              },
            },
          },
        },
        confirmations: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      return {
        error: "Match non trouvé",
      };
    }

    const equipe1 = match.equipe1;
    const equipe2 = match.equipe2;
    const MMR1 = equipe1.map((joueur) => joueur.user.MMR);
    const MMR2 = equipe2.map((joueur) => joueur.user.MMR);
    const MMR1Moy = MMR1.reduce((a, b) => a + b, 0) / MMR1.length;
    const MMR2Moy = MMR2.reduce((a, b) => a + b, 0) / MMR2.length;

    const calculateNewMMR = (
      equipe: Player[],
      MMRMoy: number,
      MMROppMoy: number,
      winnerTeam: string
    ) => {
      return equipe.map((joueur) => {
        const ProbaToWin = 1 / (1 + Math.pow(10, (MMROppMoy - MMRMoy) / 2000));
        const winner = match.winner === winnerTeam ? 1 : 0;
        const ScoreDiff =
          match.winner === winnerTeam
            ? match.scoreEquipe1 - match.scoreEquipe2
            : match.scoreEquipe2 - match.scoreEquipe1;

        const newMMR = MathMMR(
          joueur.user.MMR,
          coeffMMR,
          winner,
          ProbaToWin,
          ScoreDiff
        );

        return {
          userId: joueur.userId,
          newMMR,
          winner,
        };
      });
    };

    const updatedMMREquipe1 = calculateNewMMR(
      equipe1,
      MMR1Moy,
      MMR2Moy,
      "EQUIPE1"
    );
    const updatedMMREquipe2 = calculateNewMMR(
      equipe2,
      MMR2Moy,
      MMR1Moy,
      "EQUIPE2"
    );

    const updatePromises = [
      ...updatedMMREquipe1.map(({ userId, newMMR, winner }) =>
        prisma.user.update({
          where: { id: userId },
          data: {
            MMR: newMMR,
            victories: {
              increment: winner === 1 ? 1 : 0,
            },
            defeats: {
              increment: winner === 0 ? 1 : 0,
            },
          },
        })
      ),
      ...updatedMMREquipe2.map(({ userId, newMMR, winner }) =>
        prisma.user.update({
          where: { id: userId },
          data: {
            MMR: newMMR,
            victories: {
              increment: winner === 1 ? 1 : 0,
            },
            defeats: {
              increment: winner === 0 ? 1 : 0,
            },
          },
        })
      ),
    ];

    await prisma.$transaction(updatePromises);

    return {
      isOk: true,
      message: "MMR et statistiques mis à jour",
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Erreur lors de la mise à jour du MMR et des statistiques",
    };
  }
}
