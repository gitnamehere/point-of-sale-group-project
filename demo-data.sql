\c atspos
INSERT INTO item_category (name) VALUES ('Trinkets');
INSERT INTO item_category (name) VALUES ('Stickers');
INSERT INTO item_category (name) VALUES ('Aspirations');
INSERT INTO item_category (name) VALUES ('Food');
INSERT INTO item_category (name) VALUES ('Potatoes');

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
INSERT INTO item (category, name, description, price) VALUES (1, 'Pet Rock', 'A stone trinket with googly eyes', '9.99');

-- stickers
INSERT INTO item (category, name, description, price) VALUES (2, 'Duck Sticker', 'A sticker of a duck.', '1.99');
INSERT INTO item (category, name, description, price) VALUES (2, 'Red Sticker', 'A red sticker', '0.50');
INSERT INTO item (category, name, description, price) VALUES (2, 'Blue Sticker', 'A blue sticker', '0.50');

--food
INSERT INTO item (category, name, description, price) VALUES (4, 'Burger', 'yummy', '4.99');
INSERT INTO item (category, name, description, price) VALUES (4, 'Fries', 'yummy', '3.99');
INSERT INTO item (category, name, description, price) VALUES (4, 'Milkshake', 'yummy', '2.99');
INSERT INTO item (category, name, description, price) VALUES (4, 'Taco', 'yummy', '1.99');

--potatoes
INSERT INTO item (category, name, description, price) VALUES (5, 'potato', 'une pomme de terre', '0.99');
INSERT INTO item (category, name, description, price) VALUES (5, 'two potatoes', 'deux pommes de terre', '1.75');

--discounts
INSERT INTO discounts (code, discount) VALUES ('jotchua', '0.99');
INSERT INTO discounts (code, discount) VALUES ('michael', '0.50');

UPDATE business_information SET business_name = 'ATS', email = 'ATS@email.com', address_one = '1 Trinkets Way', address_two = 'San Antonio, TX 78015', phone_number = '123-456-7890', description = 'ATS or APES TOGETHER STRONG is a group dedicated to its craft. Nobody can stand in their way as they will always be together thus strong. Those have nothing to fear but ATS. We sell many things that appeal to a variety. If it does not appeal you, then we will come after you until it does.'
