-- AlterTable
ALTER TABLE `arc_users` ADD COLUMN `lastLoginAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `hackathon_teams` ADD COLUMN `accountId` INTEGER NULL;

-- AlterTable
ALTER TABLE `arc_days` ADD COLUMN `zoomTime` VARCHAR(60) NULL,
    ADD COLUMN `zoomLink` VARCHAR(500) NULL;

-- CreateTable
CREATE TABLE `account_logins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `event` VARCHAR(10) NOT NULL,
    `page` VARCHAR(30) NOT NULL,
    `ip` VARCHAR(64) NULL,
    `userAgent` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `account_logins_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `account_logins_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_clicks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `productKey` VARCHAR(60) NOT NULL,
    `productName` VARCHAR(120) NOT NULL,
    `price` INTEGER NULL,
    `action` VARCHAR(30) NOT NULL,
    `page` VARCHAR(30) NOT NULL,
    `ip` VARCHAR(64) NULL,
    `userAgent` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `product_clicks_userId_idx`(`userId`),
    INDEX `product_clicks_productKey_idx`(`productKey`),
    INDEX `product_clicks_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `hackathon_teams_accountId_fkey` ON `hackathon_teams`(`accountId`);

-- AddForeignKey
ALTER TABLE `hackathon_teams` ADD CONSTRAINT `hackathon_teams_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `arc_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `account_logins` ADD CONSTRAINT `account_logins_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `arc_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_clicks` ADD CONSTRAINT `product_clicks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `arc_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
