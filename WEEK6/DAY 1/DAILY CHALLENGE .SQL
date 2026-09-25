DROP TABLE IF EXISTS items, customers CASCADE;

-- Create the tables
CREATE TABLE items (
    item_id SERIAL PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL
);

CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL
);
-- Add items
INSERT INTO items (item_name, price) VALUES 
('Small Desk', 100),
('Large Desk', 300),
('Fan', 80);

-- Add customers
INSERT INTO customers (first_name, last_name) VALUES 
('Greg', 'Jones'),
('Sandra', 'Jones'),
('Scott', 'Scott'),
('Trevor', 'Green'),
('Melanie', 'Johnson');
SELECT * FROM items;
SELECT COUNT(*) AS customer_count FROM customers;
