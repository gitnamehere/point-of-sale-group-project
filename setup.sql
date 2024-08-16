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
	items JSON, -- will be changed later to something that can be an array of order_items
	subtotal DECIMAL(10,2) -- for development use only, will be removed later
);

CREATE TABLE account (
	id SERIAL PRIMARY KEY,
	username TEXT NOT NULL,
	first_name TEXT NOT NULL,
	last_name TEXT NOT NULL,
	account_type TEXT NOT NULL
);

CREATE TABLE business_information (
	id SERIAL PRIMARY KEY,
	business_name VARCHAR(50) NOT NULL,
	owner_id INT NOT NULL,
	description TEXT NOT NULL,
	CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES account(id)
);
