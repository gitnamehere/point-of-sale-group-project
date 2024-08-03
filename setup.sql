CREATE DATABASE pos;
\c pos;

CREATE TABLE item (
	id SERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL,
	category INT NOT NULL,
	description TEXT NOT NULL,
	price DECIMAL(10,2)
	CONSTRAINT fk_category FOREIGN KEY (category) REFERENCES item_category(id)
);

CREATE TABLE item_category (
	id SERIAL PRIMARY KEY,
	name VARCHAR(50)
);