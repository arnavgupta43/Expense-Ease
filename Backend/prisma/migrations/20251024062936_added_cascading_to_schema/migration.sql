-- DropForeignKey
ALTER TABLE "public"."BillParticipant" DROP CONSTRAINT "BillParticipant_billId_fkey";

-- AddForeignKey
ALTER TABLE "BillParticipant" ADD CONSTRAINT "BillParticipant_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
