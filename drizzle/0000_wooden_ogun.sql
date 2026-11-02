CREATE TABLE `delivery_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`request_key` text NOT NULL,
	`restaurant_id` text NOT NULL,
	`items` text NOT NULL,
	`subtotal` integer NOT NULL,
	`delivery` integer NOT NULL,
	`service` integer NOT NULL,
	`discount` integer NOT NULL,
	`total` integer NOT NULL,
	`address` text NOT NULL,
	`note` text NOT NULL,
	`slot` text NOT NULL,
	`status` text NOT NULL,
	`issue` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `delivery_order_idempotency` ON `delivery_orders` (`owner`,`request_key`);