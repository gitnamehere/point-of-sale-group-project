\c atspos
INSERT INTO item_category (name) VALUES ('Trinkets');
INSERT INTO item_category (name) VALUES ('Stickers');
INSERT INTO item_category (name) VALUES ('Aspirations');
INSERT INTO item_category (name) VALUES ('Food');

-- trinkets
INSERT INTO item (category, name, description, price) VALUES (1, 'Red Trinket', 'A Red Trinket', '2.99');
INSERT INTO item (category, name, description, price) VALUES (1, 'Blue Trinket', 'A trinket', '1.99');
INSERT INTO item (category, name, description, price) VALUES (1, 'Yellow Trinket', 'A trinket', '0.99');
INSERT INTO item (category, name, description, price) VALUES (1, 'Yellowed Trinket', 'trinket?', '0.05');
INSERT INTO item (category, name, description, price) VALUES (1, 'Green Trinket', 'A trinket', '12.99');
INSERT INTO item (category, name, description, price) VALUES (1, 'Metal Trinket', 'A trinket', '129.99');
INSERT INTO item (category, name, description, price) VALUES (1, 'Plastic Trinket', 'why is this trinket $178392.10', '178392.10');
INSERT INTO item (category, name, description, price) VALUES (1, 'Wooden Trinket', 'A wooden trinket', '1');
INSERT INTO item (category, name, description, price) VALUES (1, 'Wood Trinket', 'wood.', '1');
INSERT INTO item (category, name, description, price) VALUES (1, 'Wood Trinket', 'wood.', '1');
INSERT INTO item (category, name, description, price) VALUES (1, 'Wood Trinket', 'wood.', '1');
INSERT INTO item (category, name, description, price) VALUES (1, 'Wood Trinket', 'wood.', '1');

-- stickers
INSERT INTO item (category, name, description, price) VALUES (2, 'Duck Sticker', 'A sticker of a duck.', '1.99');
INSERT INTO item (category, name, description, price) VALUES (2, 'Red Sticker', 'A red sticker', '0.50');
INSERT INTO item (category, name, description, price) VALUES (2, 'Blue Sticker', 'A blue sticker', '0.50');

--food
INSERT INTO item (category, name, description, price) VALUES (4, 'Burger', 'yummy', '4.99');

--discounts
INSERT INTO discounts (code, discount) VALUES ('jotchua', '0.99');
INSERT INTO discounts (code, discount) VALUES ('michael', '0.50');
