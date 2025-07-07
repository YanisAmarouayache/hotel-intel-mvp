/*
  Warnings:

  - You are about to alter the column `userRating` on the `hotels` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "hotels" ALTER COLUMN "userRating" SET DATA TYPE INTEGER;
