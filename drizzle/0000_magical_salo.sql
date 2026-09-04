CREATE TABLE `menu_items` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`name` text NOT NULL,
	`note` text,
	`listed_price` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `order_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_menu_items_session_sort` ON `menu_items` (`session_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `order_selections` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`member_id` text NOT NULL,
	`member_name` text NOT NULL,
	`menu_item_id` text,
	`custom_item_name` text,
	`quantity` integer DEFAULT 1 NOT NULL,
	`final_unit_price` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `order_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_order_selections_session_member` ON `order_selections` (`session_id`,`member_id`);--> statement-breakpoint
CREATE TABLE `order_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`phase` text DEFAULT 'open' NOT NULL,
	`orderer_id` text NOT NULL,
	`orderer_name` text NOT NULL,
	`deadline_at` integer,
	`total_bill` integer DEFAULT 0 NOT NULL,
	`total_items` integer DEFAULT 0 NOT NULL,
	`settlement_method` text DEFAULT 'equal' NOT NULL,
	`bank_info` text,
	`qr_object_key` text,
	`created_at` integer NOT NULL,
	`completed_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_order_sessions_phase_created` ON `order_sessions` (`phase`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_order_sessions_orderer_created` ON `order_sessions` (`orderer_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `payment_records` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`member_id` text NOT NULL,
	`member_name` text NOT NULL,
	`amount_due` integer NOT NULL,
	`marked_paid_at` integer,
	FOREIGN KEY (`session_id`) REFERENCES `order_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_payment_records_session_paid` ON `payment_records` (`session_id`,`marked_paid_at`);--> statement-breakpoint
CREATE INDEX `idx_payment_records_member_session` ON `payment_records` (`member_id`,`session_id`);