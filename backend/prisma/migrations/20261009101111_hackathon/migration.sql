-- CreateTable
CREATE TABLE `hackathon_teams` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teamName` VARCHAR(120) NOT NULL,
    `category` VARCHAR(20) NOT NULL,
    `idea` TEXT NULL,
    `paid` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `hackathon_teams_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hackathon_members` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teamId` INTEGER NOT NULL,
    `position` INTEGER NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `phone` VARCHAR(15) NOT NULL,
    `email` VARCHAR(191) NULL,
    `organisation` VARCHAR(191) NULL,

    INDEX `hackathon_members_teamId_idx`(`teamId`),
    INDEX `hackathon_members_phone_idx`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `hackathon_members` ADD CONSTRAINT `hackathon_members_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `hackathon_teams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
