DROP DATABASE IF EXISTS atspos;
CREATE DATABASE atspos;
\c atspos;

CREATE TABLE item_category (
	id SERIAL PRIMARY KEY,
	name VARCHAR(50)
);

CREATE TABLE item (
	id SERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL,
	category INT NOT NULL,
	description TEXT NOT NULL,
	price DECIMAL(10,2),
	is_deleted BOOLEAN DEFAULT false,
	CONSTRAINT fk_item_category FOREIGN KEY (category) REFERENCES item_category(id)
);

CREATE TABLE cart_item (
	id SERIAL PRIMARY KEY,
	item_id INT NOT NULL,
	quantity INT NOT NULL,
	CONSTRAINT fk_item_id FOREIGN KEY (item_id) REFERENCES item(id)
);

CREATE TABLE orders (
	id SERIAL PRIMARY KEY,
	items JSON, -- TODO: remove this once this isn't used anymore (deprecated)
	subtotal DECIMAL(10,2),
	discount DECIMAL(10,2),
	tips DECIMAL(10, 2),
	total DECIMAL(10,2),
	is_paid BOOLEAN DEFAULT false,
	is_void BOOLEAN DEFAULT false,
	date_ordered DATE NOT NULL
);

CREATE TABLE order_item (
	id SERIAL PRIMARY KEY,
	item_id INT NOT NULL,
	quantity INT NOT NULL,
	order_id INT NOT NULL,
	CONSTRAINT fk_item_id FOREIGN KEY (item_id) REFERENCES item(id),
	CONSTRAINT fk_order_id FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE discounts (
	id SERIAL PRIMARY KEY,
	code VARCHAR(10) NOT NULL,
	discount DECIMAL(10,2)
);

CREATE TYPE permissions AS ENUM ('user', 'admin', 'boss');

-- pos accounts
CREATE TABLE accounts (
	id SERIAL PRIMARY KEY,
	username TEXT NOT NULL,
	password TEXT NOT NULL,
	first_name TEXT NOT NULL,
	last_name TEXT NOT NULL,
	account_type permissions
);

-- customer account
CREATE TABLE customer (
	first_name TEXT,
	last_name TEXT,
	phone_number VARCHAR(15) NOT NULL,
	email VARCHAR
);

CREATE TABLE tokens (
	id SERIAL PRIMARY KEY,
	token VARCHAR(256) NOT NULL,
	user_id INT NOT NULL,
	CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES accounts(id)
);

CREATE TABLE business_information (
	id SERIAL PRIMARY KEY,
	business_name TEXT NOT NULL,
	email TEXT NOT NULL,
	phone_number VARCHAR(12) NOT NULL, --Phone example: 800-123-4567
	address_one TEXT NOT NULL,
	address_two TEXT NOT NULL,
	description TEXT NOT NULL
);

INSERT INTO business_information (business_name, email, phone_number, address_one, address_two, description) VALUES ('Business', 'test@example.com', '000-000-0000', '1 Placeholder St', 'A, TX 00000', 'Insert business description here');

CREATE TABLE themes (
	id SERIAL PRIMARY KEY,
	background_color TEXT,
	header_color TEXT
);

INSERT INTO themes (background_color, header_color) VALUES ('#EEEEEE', '#111111');
