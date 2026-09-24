CREATE TABLE `inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`subject` text DEFAULT 'Projektanfrage' NOT NULL,
	`message` text NOT NULL,
	`configuration` text,
	`estimated_price` integer,
	`created_at` integer NOT NULL
);
