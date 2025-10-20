/*
  Warnings:

  - Added the required column `category` to the `PersonalExpense` table without a default value. This is not possible if the table is not empty.
  - Made the column `note` on table `PersonalExpense` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('FOOD', 'TRAVEL', 'GROCERY', 'SHOPPING', 'RENT', 'UTILITIES', 'HEALTH', 'ENTERTAINMENT', 'EDUCATION', 'SUBSCRIPTION', 'OTHERS');

-- AlterTable
ALTER TABLE "PersonalExpense" DROP COLUMN "category",
ADD COLUMN     "category" "ExpenseCategory" NOT NULL,
ALTER COLUMN "note" SET NOT NULL;
