-- RAWCONNECT — Migration pour compte agent (DB existante)
-- Exécuter si vous avez déjà une base créée : mysql rawconnect < backend/db/migration_agent.sql
-- Ou via Python : execute le fichier via pymysql

SET NAMES utf8mb4;

ALTER TABLE `users`
    ADD COLUMN `role` VARCHAR(20) NOT NULL DEFAULT 'client' COMMENT 'client, agent' AFTER `pin`,
    ADD COLUMN `agent_zone` VARCHAR(100) DEFAULT NULL COMMENT 'zone géographique agent' AFTER `role`;

ALTER TABLE `accounts`
    ADD COLUMN `agent_float` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT 'solde exploitation agent' AFTER `balance`,
    ADD COLUMN `agent_commission_balance` DECIMAL(14,2) NOT NULL DEFAULT 0.00 COMMENT 'commissions agent' AFTER `agent_float`;

ALTER TABLE `transactions`
    ADD COLUMN `agent_id` INT UNSIGNED DEFAULT NULL COMMENT 'si transaction via agent' AFTER `description`,
    ADD COLUMN `commission` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'commission agent' AFTER `agent_id`;
