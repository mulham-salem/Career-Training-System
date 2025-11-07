/*
  Warnings:

  - You are about to drop the column `senderId` on the `Message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_senderId_fkey`;

-- DropIndex
DROP INDEX `Message_senderId_fkey` ON `Message`;

-- AlterTable
ALTER TABLE `Message` DROP COLUMN `senderId`;
