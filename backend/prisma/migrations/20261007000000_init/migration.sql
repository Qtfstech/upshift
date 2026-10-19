-- CreateTable
CREATE TABLE `admins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(120) NOT NULL,
    `passwordHash` VARCHAR(100) NOT NULL,
    `tokenVersion` INTEGER NOT NULL DEFAULT 0,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admins_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sheet_sources` (
    `id` VARCHAR(40) NOT NULL,
    `fileName` VARCHAR(191) NULL,
    `sheetName` VARCHAR(191) NULL,
    `ok` BOOLEAN NOT NULL DEFAULT false,
    `error` TEXT NULL,
    `checks` JSON NULL,
    `warnings` JSON NULL,
    `summaryTitle` VARCHAR(191) NULL,
    `summaryColumns` JSON NULL,
    `hash` CHAR(64) NULL,
    `dataAt` DATETIME(3) NULL,
    `checkedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ad_spend_rows` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `owner` VARCHAR(40) NOT NULL,
    `date` DATE NOT NULL,
    `campaign` VARCHAR(191) NOT NULL,
    `leads` INTEGER NOT NULL,
    `spend` DECIMAL(12, 2) NOT NULL,
    `cpl` DECIMAL(12, 2) NULL,

    INDEX `ad_spend_rows_owner_date_idx`(`owner`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `awareness_rows` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `owner` VARCHAR(40) NOT NULL,
    `date` DATE NOT NULL,
    `campaign` VARCHAR(191) NOT NULL,
    `reach` INTEGER NOT NULL,
    `spend` DECIMAL(12, 2) NOT NULL,
    `costPer1k` DECIMAL(12, 2) NULL,

    INDEX `awareness_rows_owner_date_idx`(`owner`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campaign_summaries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `owner` VARCHAR(40) NOT NULL,
    `position` INTEGER NOT NULL,
    `campaign` VARCHAR(191) NOT NULL,
    `leads` INTEGER NOT NULL,
    `spend` DECIMAL(12, 2) NOT NULL,
    `cpl` DECIMAL(12, 2) NULL,
    `counts` JSON NOT NULL,

    INDEX `campaign_summaries_owner_idx`(`owner`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `awareness_summaries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `owner` VARCHAR(40) NOT NULL,
    `position` INTEGER NOT NULL,
    `campaign` VARCHAR(191) NOT NULL,
    `reach` INTEGER NOT NULL,
    `spend` DECIMAL(12, 2) NOT NULL,
    `costPer1k` DECIMAL(12, 2) NULL,

    INDEX `awareness_summaries_owner_idx`(`owner`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sales_workshops` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `position` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `students` INTEGER NOT NULL,
    `amountColumn` VARCHAR(8) NULL,
    `dateColumn` VARCHAR(8) NULL,
    `studentColumn` VARCHAR(8) NULL,
    `headerRow` INTEGER NULL,
    `detectedBy` VARCHAR(10) NOT NULL,
    `warnings` JSON NOT NULL,

    UNIQUE INDEX `sales_workshops_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sales_payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workshopId` INTEGER NOT NULL,
    `paidOn` DATE NULL,
    `amount` DECIMAL(12, 2) NULL,
    `student` VARCHAR(191) NOT NULL,

    INDEX `sales_payments_workshopId_idx`(`workshopId`),
    INDEX `sales_payments_paidOn_idx`(`paidOn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sales_skipped_tabs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sync_runs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finishedAt` DATETIME(3) NULL,
    `ok` BOOLEAN NOT NULL DEFAULT false,
    `fresh` BOOLEAN NOT NULL DEFAULT false,
    `error` TEXT NULL,
    `sources` JSON NULL,

    INDEX `sync_runs_startedAt_idx`(`startedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sales_payments` ADD CONSTRAINT `sales_payments_workshopId_fkey` FOREIGN KEY (`workshopId`) REFERENCES `sales_workshops`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

