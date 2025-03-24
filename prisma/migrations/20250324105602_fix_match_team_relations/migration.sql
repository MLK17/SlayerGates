/*
  Warnings:

  - You are about to drop the column `date` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Match` table. All the data in the column will be lost.
  - Added the required column `round` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_winner_id_fkey";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "date",
DROP COLUMN "location",
ADD COLUMN     "completed_time" TIMESTAMP(3),
ADD COLUMN     "round" INTEGER NOT NULL,
ADD COLUMN     "scheduled_time" TIMESTAMP(3);
