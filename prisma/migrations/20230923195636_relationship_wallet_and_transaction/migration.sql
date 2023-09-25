-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_receive_wallet_id_fkey` FOREIGN KEY (`receive_wallet_id`) REFERENCES `Wallet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_sender_wallet_id_fkey` FOREIGN KEY (`sender_wallet_id`) REFERENCES `Wallet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
