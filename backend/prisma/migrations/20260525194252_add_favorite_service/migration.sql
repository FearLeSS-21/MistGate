-- CreateTable
CREATE TABLE `FavoriteService` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `serviceType` ENUM('NATIONAL_ID', 'MILITARY_EXEMPTION', 'BIRTH_CERTIFICATE', 'PASSPORT', 'TAX_PAYMENT', 'TRAFFIC_FINE', 'HEALTH_INSURANCE', 'SOCIAL_INSURANCE') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `FavoriteService_userId_serviceType_key`(`userId`, `serviceType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FavoriteService` ADD CONSTRAINT `FavoriteService_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
