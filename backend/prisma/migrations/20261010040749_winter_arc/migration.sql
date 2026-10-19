-- CreateTable
CREATE TABLE `arc_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(15) NOT NULL,
    `name` VARCHAR(60) NOT NULL,
    `collegeCity` VARCHAR(191) NOT NULL,
    `year` VARCHAR(40) NOT NULL,
    `branch` VARCHAR(60) NOT NULL,
    `email` VARCHAR(191) NULL,
    `heardFrom` VARCHAR(60) NULL,
    `utmSource` VARCHAR(120) NULL,
    `utmMedium` VARCHAR(120) NULL,
    `utmCampaign` VARCHAR(120) NULL,
    `publishOk` BOOLEAN NOT NULL DEFAULT false,
    `classUpdatesOk` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `arc_users_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `arc_consents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `box` VARCHAR(20) NOT NULL,
    `ticked` BOOLEAN NOT NULL,
    `label` TEXT NOT NULL,
    `pageVersion` VARCHAR(20) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `arc_consents_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `arc_entries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `userId` INTEGER NOT NULL,
    `day` INTEGER NOT NULL,
    `title` VARCHAR(80) NOT NULL,
    `problem` TEXT NOT NULL,
    `idea` TEXT NOT NULL,
    `howItWorks` TEXT NOT NULL,
    `firstTest` TEXT NOT NULL,
    `tools` VARCHAR(150) NULL,
    `contentHash` CHAR(64) NOT NULL,
    `flagReason` VARCHAR(255) NOT NULL DEFAULT '',
    `adminDecision` VARCHAR(10) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `arc_entries_code_key`(`code`),
    INDEX `arc_entries_day_idx`(`day`),
    INDEX `arc_entries_contentHash_idx`(`contentHash`),
    UNIQUE INDEX `arc_entries_userId_day_key`(`userId`, `day`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `arc_results` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day` INTEGER NOT NULL,
    `rank` INTEGER NOT NULL,
    `entryId` INTEGER NOT NULL,
    `visibleFrom` DATETIME(3) NOT NULL,
    `contacted` BOOLEAN NOT NULL DEFAULT false,
    `idChecked` BOOLEAN NOT NULL DEFAULT false,
    `callDone` BOOLEAN NOT NULL DEFAULT false,
    `shipped` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `arc_results_entryId_key`(`entryId`),
    UNIQUE INDEX `arc_results_day_rank_key`(`day`, `rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `arc_access_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `admin` VARCHAR(120) NOT NULL,
    `ip` VARCHAR(64) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `arc_consents` ADD CONSTRAINT `arc_consents_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `arc_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `arc_entries` ADD CONSTRAINT `arc_entries_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `arc_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `arc_results` ADD CONSTRAINT `arc_results_entryId_fkey` FOREIGN KEY (`entryId`) REFERENCES `arc_entries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
