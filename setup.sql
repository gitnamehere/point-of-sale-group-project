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
	CONSTRAINT fk_item_category FOREIGN KEY (category) REFERENCES item_category(id)
);

CREATE TABLE order_item (
	id SERIAL PRIMARY KEY,
	item_id INT NOT NULL,
	quantity INT NOT NULL,
	date_ordered DATE NOT NULL,
	CONSTRAINT fk_item_id FOREIGN KEY (item_id) REFERENCES item(id)
);

CREATE TABLE cart_item (
	id SERIAL PRIMARY KEY,
	item_id INT NOT NULL,
	quantity INT NOT NULL,
	CONSTRAINT fk_item_id FOREIGN KEY (item_id) REFERENCES item(id)
);

--wip
CREATE TABLE orders (
	id SERIAL PRIMARY KEY,
	items JSON, -- revisit for possible junction table implementation
	subtotal DECIMAL(10,2),
	discount DECIMAL(10,2),
	total DECIMAL(10,2),
	payment_status BOOLEAN,
	date_ordered DATE
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
	business_name VARCHAR(50) NOT NULL,
	phone_number VARCHAR(15) NOT NULL, --Phone example: 1-800-123-456
	address TEXT NOT NULL,
	description TEXT NOT NULL
);
