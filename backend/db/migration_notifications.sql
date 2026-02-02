-- RAWCONNECT — Migration notifications (SMS simulés)
-- Exécuter sur une base existante: mysql rawconnect < backend/db/migration_notifications.sql

CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(20) NOT NULL COMMENT 'destinataire (agent ou client)',
    `recipient` VARCHAR(20) NOT NULL DEFAULT 'client' COMMENT 'agent, client',
    `message` TEXT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `ix_notifications_phone` (`phone`),
    KEY `ix_notifications_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
