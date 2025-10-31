-- DropForeignKey
ALTER TABLE "public"."PersonalExpense" DROP CONSTRAINT "PersonalExpense_userId_fkey";

-- AddForeignKey
ALTER TABLE "PersonalExpense" ADD CONSTRAINT "PersonalExpense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
