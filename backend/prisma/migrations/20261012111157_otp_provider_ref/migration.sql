-- AlterTable
ALTER TABLE `otp_codes` ADD COLUMN `providerRef` VARCHAR(80) NULL,
    MODIFY `codeHash` CHAR(64) NULL;
