/*
  Warnings:

  - You are about to drop the column `balance` on the `Worker` table. All the data in the column will be lost.
  - Changed the type of `pending_bal` on the `Worker` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `locked_bal` on the `Worker` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "done" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Worker" DROP COLUMN "balance",
DROP COLUMN "pending_bal",
ADD COLUMN     "pending_bal" INTEGER NOT NULL,
DROP COLUMN "locked_bal",
ADD COLUMN     "locked_bal" INTEGER NOT NULL;
