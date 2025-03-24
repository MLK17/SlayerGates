/*
  Warnings:

  - You are about to drop the column `completed_time` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `player1_id` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `player2_id` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `round` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `scheduled_time` on the `Match` table. All the data in the column will be lost.
  - Added the required column `date` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team1_id` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team2_id` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Match" DROP COLUMN "completed_time",
DROP COLUMN "player1_id",
DROP COLUMN "player2_id",
DROP COLUMN "round",
DROP COLUMN "scheduled_time",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "location" VARCHAR(255),
ADD COLUMN     "team1_id" INTEGER NOT NULL,
ADD COLUMN     "team2_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_team1_id_fkey" FOREIGN KEY ("team1_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_team2_id_fkey" FOREIGN KEY ("team2_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
