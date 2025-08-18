-- CreateTable
CREATE TABLE `device_auths` (
    `session` VARCHAR(50) NOT NULL,
    `id` VARCHAR(100) NOT NULL,
    `value` JSON NULL,

    INDEX `idxsession`(`session`),
    INDEX `idxid`(`id`),
    UNIQUE INDEX `device_auths_session_id_key`(`session`, `id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
