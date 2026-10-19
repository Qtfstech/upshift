-- CreateTable
CREATE TABLE `idea_submissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `college` VARCHAR(191) NULL,
    `stage` VARCHAR(60) NULL,
    `title` VARCHAR(120) NOT NULL,
    `category` VARCHAR(40) NOT NULL,
    `problem` TEXT NOT NULL,
    `idea` TEXT NOT NULL,
    `showOnWall` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idea_submissions_createdAt_idx`(`createdAt`),
    INDEX `idea_submissions_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

