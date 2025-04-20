-- DropForeignKey
ALTER TABLE "UptimeLog" DROP CONSTRAINT "UptimeLog_websiteId_fkey";

-- AddForeignKey
ALTER TABLE "UptimeLog" ADD CONSTRAINT "UptimeLog_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;
