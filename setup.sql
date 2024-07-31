CREATE DATABASE pos;
\c pos;
-- TODO: add item table here
CREATE TABLE item_category (
	id SERIAL PRIMARY KEY,
	name VARCHAR(50)
);
