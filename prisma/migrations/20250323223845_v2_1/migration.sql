/*
  Warnings:

  - Added the required column `players_per_team` to the `Tournament` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "players_per_team" INTEGER NOT NULL;
