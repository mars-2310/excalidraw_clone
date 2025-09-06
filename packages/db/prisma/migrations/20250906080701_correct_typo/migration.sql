/*
  Warnings:

  - You are about to drop the column `useId` on the `Chat` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_useId_fkey";

-- AlterTable
ALTER TABLE "public"."Chat" DROP COLUMN "useId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Chat" ADD CONSTRAINT "Chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
