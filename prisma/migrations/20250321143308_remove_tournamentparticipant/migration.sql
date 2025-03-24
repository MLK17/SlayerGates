/*
  Warnings:

  - You are about to drop the `TournamentParticipant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TournamentParticipant" DROP CONSTRAINT "TournamentParticipant_tournament_id_fkey";

-- DropForeignKey
ALTER TABLE "TournamentParticipant" DROP CONSTRAINT "TournamentParticipant_user_id_fkey";

-- DropTable
DROP TABLE "TournamentParticipant";
