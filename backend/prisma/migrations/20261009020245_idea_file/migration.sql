-- AlterTable
ALTER TABLE `idea_submissions` ADD COLUMN `fileName` VARCHAR(191) NULL,
    ADD COLUMN `fileSize` INTEGER NULL,
    ADD COLUMN `fileStored` VARCHAR(80) NULL,
    ADD COLUMN `fileType` VARCHAR(120) NULL;
