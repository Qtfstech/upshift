-- AlterTable
ALTER TABLE `arc_entries` ADD COLUMN `score` INTEGER NULL,
    ADD COLUMN `shortlisted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `zoomInvited` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `zoomAttended` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `workshopConverted` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `arc_days` (
    `day` INTEGER NOT NULL,
    `topic` VARCHAR(80) NULL,
    `prompt` VARCHAR(255) NULL,
    `prizeName` VARCHAR(120) NULL,
    `prizeDescription` VARCHAR(500) NULL,
    `prizeImageUrl` VARCHAR(500) NULL,
    `prizeConfirmed` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`day`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
