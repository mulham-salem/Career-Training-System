/*
  Warnings:

  - The values [READ,FAILD] on the enum `Message_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Message` MODIFY `status` ENUM('PENDING', 'SENT', 'FAILED') NOT NULL DEFAULT 'PENDING';
