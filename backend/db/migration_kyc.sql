-- RAWCONNECT — Migration KYC L1 (date_of_birth, kyc_level, OTP)
-- Pour base existante: mysql rawconnect < backend/db/migration_kyc.sql

ALTER TABLE `users`
    ADD COLUMN `date_of_birth` DATE DEFAULT NULL COMMENT 'KYC L1: date de naissance' AFTER `name`,
    ADD COLUMN `kyc_level` VARCHAR(20) NOT NULL DEFAULT 'LIGHT' COMMENT 'LIGHT=KYC1 USSD' AFTER `activity_type`;

CREATE TABLE IF NOT EXISTS `otp_verifications` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(20) NOT NULL,
    `code` VARCHAR(8) NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `used_at` DATETIME DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `ix_otp_phone` (`phone`),
    KEY `ix_otp_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
