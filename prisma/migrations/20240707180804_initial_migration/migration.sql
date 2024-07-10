-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "Winner" AS ENUM ('EQUIPE1', 'EQUIPE2');

-- CreateTable
CREATE TABLE "User" (
    "_id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "MMR" INTEGER NOT NULL DEFAULT 0,
    "EPI" INTEGER NOT NULL DEFAULT 0,
    "victories" INTEGER NOT NULL DEFAULT 0,
    "defeats" INTEGER NOT NULL DEFAULT 0,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Match" (
    "_id" UUID NOT NULL,
    "winner" "Winner",
    "scoreEquipe1" INTEGER NOT NULL,
    "scoreEquipe2" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estConfirme" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Equipe1" (
    "_id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "matchId" UUID NOT NULL,

    CONSTRAINT "Equipe1_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Equipe2" (
    "_id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "matchId" UUID NOT NULL,

    CONSTRAINT "Equipe2_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Confirmation" (
    "_id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "matchId" UUID NOT NULL,

    CONSTRAINT "Confirmation_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Equipe1" ADD CONSTRAINT "Equipe1_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipe1" ADD CONSTRAINT "Equipe1_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipe2" ADD CONSTRAINT "Equipe2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipe2" ADD CONSTRAINT "Equipe2_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Confirmation" ADD CONSTRAINT "Confirmation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Confirmation" ADD CONSTRAINT "Confirmation_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
