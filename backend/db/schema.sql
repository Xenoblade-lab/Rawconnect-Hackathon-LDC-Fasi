-- RAWCONNECT — Schéma SQL (MySQL)
-- Création des tables

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------
-- users
-- --------------------------------------
DROP TABLE IF EXISTS `otp_verifications`;
DROP TABLE IF EXISTS `loan_repayments`;
DROP TABLE IF EXISTS `loans`;
DROP TABLE IF EXISTS `scores`;
DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `accounts`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(20) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `date_of_birth` DATE DEFAULT NULL COMMENT 'KYC L1: date de naissance',
    `activity_type` VARCHAR(60) DEFAULT NULL COMMENT 'marché, étudiant, agriculture, etc.',
    `kyc_level` VARCHAR(20) NOT NULL DEFAULT 'LIGHT' COMMENT 'LIGHT=KYC1 USSD, EXTENDED=KYC2',
    `pin` VARCHAR(20) NOT NULL DEFAULT '0000' COMMENT 'PIN 4 chiffres (démo)',
    `role` VARCHAR(20) NOT NULL DEFAULT 'client' COMMENT 'client, agent',
    `agent_zone` VARCHAR(100) DEFAULT NULL COMMENT 'zone géographique agent',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_users_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------
-- otp_verifications (KYC L1: vérification OTP)
-- --------------------------------------
CREATE TABLE `otp_verifications` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(20) NOT NULL,
    `code` VARCHAR(8) NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `used_at` DATETIME DEFAULT NULL COMMENT 'NULL = non utilisé',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `ix_otp_phone` (`phone`),
    KEY `ix_otp_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------
-- accounts
-- --------------------------------------
CREATE TABLE `accounts` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `balance` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    `agent_float` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT 'solde exploitation agent',
    `agent_commission_balance` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT 'commissions agent',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_accounts_user` (`user_id`),
    CONSTRAINT `fk_accounts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------
-- transactions
-- --------------------------------------
CREATE TABLE `transactions` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `account_id` INT UNSIGNED NOT NULL,
    `type` VARCHAR(32) NOT NULL COMMENT 'deposit, withdrawal, payment, loan',
    `amount` DECIMAL(14,2) NOT NULL,
    `description` VARCHAR(255) DEFAULT NULL,
    `agent_id` INT UNSIGNED DEFAULT NULL COMMENT 'si transaction via agent',
    `commission` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'commission agent',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `ix_transactions_account` (`account_id`),
    KEY `ix_transactions_created` (`created_at`),
    KEY `ix_transactions_agent` (`agent_id`),
    CONSTRAINT `fk_transactions_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_transactions_agent` FOREIGN KEY (`agent_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------
-- scores
-- --------------------------------------
CREATE TABLE `scores` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `score` DECIMAL(5,2) NOT NULL COMMENT '0–100',
    `last_updated` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_scores_user` (`user_id`),
    CONSTRAINT `fk_scores_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------
-- loans
-- --------------------------------------
CREATE TABLE `loans` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `amount` DECIMAL(14,2) NOT NULL,
    `interest_rate` DECIMAL(5,4) NOT NULL DEFAULT 0.0500,
    `status` VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT 'pending, active, paid, defaulted',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `due_date` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `ix_loans_user` (`user_id`),
    CONSTRAINT `fk_loans_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------
-- notifications (SMS simulés pour agent/client)
-- --------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(20) NOT NULL COMMENT 'destinataire (agent ou client)',
    `recipient` VARCHAR(20) NOT NULL DEFAULT 'client' COMMENT 'agent, client',
    `message` TEXT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `ix_notifications_phone` (`phone`),
    KEY `ix_notifications_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------
-- loan_repayments
-- --------------------------------------
CREATE TABLE `loan_repayments` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `loan_id` INT UNSIGNED NOT NULL,
    `amount` DECIMAL(14,2) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `ix_loan_repayments_loan` (`loan_id`),
    CONSTRAINT `fk_loan_repayments_loan` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
