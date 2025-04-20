/*
  Warnings:

  - The `status` column on the `Website` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `status` on the `UptimeLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('up', 'down', 'pending');

-- AlterTable
ALTER TABLE "UptimeLog" ADD COLUMN     "responseTime" INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL;

-- AlterTable
ALTER TABLE "Website" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'pending';
