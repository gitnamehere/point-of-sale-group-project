DROP DATABASE IF EXISTS pos;
CREATE DATABASE pos;
\c pos;

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

-- if we are going to use order_item, we should remove the foreign key, and add in
-- a name and price column in case the user want to delete an item and you won't have to
-- delete the corresponding order_item
-- otherwise we could add an is_deleted boolean in the item table so the item is soft deleted
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
	items JSON, -- revisit for possible junction table implementation (order_item)
	subtotal DECIMAL(10,2),
	discount DECIMAL(10,2),
	tips DECIMAL(10, 2),
	total DECIMAL(10,2),
	is_paid BOOLEAN,
	is_void BOOLEAN,
	date_ordered DATE, -- TODO: change this to NOT NULL
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
