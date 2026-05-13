-- DropForeignKey
ALTER TABLE "Website" DROP CONSTRAINT "Website_user_id_fkey";

-- AddForeignKey
ALTER TABLE "Website" ADD CONSTRAINT "Website_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
