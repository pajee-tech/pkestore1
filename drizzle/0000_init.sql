CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`user_name` varchar(120),
	`action` varchar(60) NOT NULL,
	`entity` varchar(60) NOT NULL,
	`entity_id` varchar(60),
	`details` varchar(500),
	`ip` varchar(64),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parent_id` int,
	`name` varchar(120) NOT NULL,
	`slug` varchar(160) NOT NULL,
	`description` text,
	`content` mediumtext,
	`image` varchar(500),
	`banner_image` varchar(500),
	`icon` varchar(60),
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`show_in_menu` boolean NOT NULL DEFAULT true,
	`seo_title` varchar(191),
	`seo_description` varchar(320),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(40) NOT NULL,
	`type` enum('PERCENT','FIXED','FREE_SHIPPING') NOT NULL DEFAULT 'PERCENT',
	`value` decimal NOT NULL DEFAULT 0,
	`min_order` decimal NOT NULL DEFAULT 0,
	`max_uses` int,
	`used_count` int NOT NULL DEFAULT 0,
	`expires_at` datetime,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_uq` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`url` varchar(500) NOT NULL,
	`filename` varchar(191) NOT NULL,
	`alt` varchar(191),
	`size` int NOT NULL,
	`width` int,
	`height` int,
	`uploaded_by` int,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menu_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`location` enum('HEADER','FOOTER_SHOP','FOOTER_HELP','TOPBAR') NOT NULL,
	`label` varchar(80) NOT NULL,
	`url` varchar(300) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`open_new_tab` boolean NOT NULL DEFAULT false,
	CONSTRAINT `menu_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(191),
	`phone` varchar(30),
	`subject` varchar(191),
	`message` text NOT NULL,
	`is_read` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`product_id` int,
	`name` varchar(191) NOT NULL,
	`image` varchar(500),
	`price` decimal NOT NULL,
	`quantity` int NOT NULL,
	`supplier_url` varchar(500),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_number` varchar(30) NOT NULL,
	`customer_name` varchar(120) NOT NULL,
	`phone` varchar(30) NOT NULL,
	`email` varchar(191),
	`city` varchar(80) NOT NULL,
	`address` varchar(500) NOT NULL,
	`notes` varchar(500),
	`subtotal` decimal NOT NULL,
	`shipping_fee` decimal NOT NULL,
	`discount` decimal NOT NULL DEFAULT 0,
	`total` decimal NOT NULL,
	`coupon_code` varchar(40),
	`payment_method` enum('COD','BANK','JAZZCASH','EASYPAISA') NOT NULL DEFAULT 'COD',
	`payment_status` enum('UNPAID','PENDING_VERIFICATION','PAID','REFUNDED') NOT NULL DEFAULT 'UNPAID',
	`transaction_id` varchar(80),
	`payment_proof` varchar(500),
	`status` enum('PENDING','CONFIRMED','ORDERED_FROM_SUPPLIER','SHIPPED','DELIVERED','CANCELLED','RETURNED') NOT NULL DEFAULT 'PENDING',
	`courier` varchar(60),
	`tracking_number` varchar(80),
	`admin_notes` text,
	`ip` varchar(64),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_number_uq` UNIQUE(`order_number`)
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('PAGE','PILLAR','CLUSTER') NOT NULL DEFAULT 'PAGE',
	`parent_id` int,
	`category_id` int,
	`title` varchar(191) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`excerpt` varchar(500),
	`content` mediumtext,
	`cover_image` varchar(500),
	`status` enum('DRAFT','PUBLISHED') NOT NULL DEFAULT 'DRAFT',
	`show_in_footer` boolean NOT NULL DEFAULT false,
	`author_name` varchar(120),
	`published_at` datetime,
	`seo_title` varchar(191),
	`seo_description` varchar(320),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `pages_type_slug_uq` UNIQUE(`type`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_id` int NOT NULL,
	`name` varchar(191) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`sku` varchar(80),
	`short_description` varchar(500),
	`description` mediumtext,
	`price` decimal NOT NULL,
	`compare_price` decimal,
	`cost_price` decimal,
	`stock` int NOT NULL DEFAULT 100,
	`images` json NOT NULL,
	`features` json,
	`specs` json,
	`badge` varchar(40),
	`supplier_name` varchar(120),
	`supplier_url` varchar(500),
	`supplier_sku` varchar(120),
	`delivery_days` varchar(40),
	`rating` decimal(2,1) NOT NULL DEFAULT 4.5,
	`review_count` int NOT NULL DEFAULT 0,
	`sold_count` int NOT NULL DEFAULT 0,
	`is_featured` boolean NOT NULL DEFAULT false,
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`seo_title` varchar(191),
	`seo_description` varchar(320),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` varchar(191) NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	`reset_at` datetime NOT NULL,
	CONSTRAINT `rate_limits_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` varchar(40) NOT NULL,
	`title` varchar(191),
	`subtitle` varchar(320),
	`config` json NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(64) NOT NULL,
	`user_id` int NOT NULL,
	`expires_at` datetime NOT NULL,
	`ip` varchar(64),
	`user_agent` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` varchar(80) NOT NULL,
	`value` json NOT NULL,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `settings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(191) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscribers_email_uq` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(191) NOT NULL,
	`password_hash` varchar(191) NOT NULL,
	`role` enum('SUPER_ADMIN','ADMIN','EDITOR','MARKETER','ORDER_MANAGER') NOT NULL DEFAULT 'EDITOR',
	`is_active` boolean NOT NULL DEFAULT true,
	`last_login_at` datetime,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_uq` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `activity_created_idx` ON `activity_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `categories_parent_idx` ON `categories` (`parent_id`);--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `orders_phone_idx` ON `orders` (`phone`);--> statement-breakpoint
CREATE INDEX `pages_parent_idx` ON `pages` (`parent_id`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `products_active_idx` ON `products` (`is_active`,`is_featured`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);