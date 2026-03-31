-- MySQL Database Initialization for FlowStock

CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table (With manual password hashing)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY, -- Using UUID as string
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role_id INT,
    status VARCHAR(20) DEFAULT 'active',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Categories Table
CREATE TABLE IF NOT EXISTS product_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brands Table
CREATE TABLE IF NOT EXISTS brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Units Table
CREATE TABLE IF NOT EXISTS units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    abbreviation VARCHAR(10),
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Packaging Types Table
CREATE TABLE IF NOT EXISTS packaging_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT,
    brand_id INT,
    total_packaging VARCHAR(100),
    net_weight VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_categories(id),
    FOREIGN KEY (brand_id) REFERENCES brands(id)
);

-- Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36),
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    unit_price DECIMAL(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Inventory Movement Types
CREATE TABLE IF NOT EXISTS inventory_movement_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    direction ENUM('in', 'out') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Ledger
CREATE TABLE IF NOT EXISTS inventory_ledger (
    id VARCHAR(36) PRIMARY KEY,
    variant_id VARCHAR(36),
    movement_type_id INT,
    quantity INT NOT NULL,
    balance INT NOT NULL,
    notes TEXT,
    recorded_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id),
    FOREIGN KEY (movement_type_id) REFERENCES inventory_movement_types(id),
    FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY,
    store_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    assigned_salesman_id VARCHAR(36),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_salesman_id) REFERENCES users(id)
);

-- Sales Transactions
CREATE TABLE IF NOT EXISTS sales_transactions (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36),
    salesman_id VARCHAR(36),
    total_amount DECIMAL(15, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (salesman_id) REFERENCES users(id)
);

-- Sales Transaction Items
CREATE TABLE IF NOT EXISTS sales_transaction_items (
    id VARCHAR(36) PRIMARY KEY,
    transaction_id VARCHAR(36),
    variant_id VARCHAR(36),
    quantity INT NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES sales_transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36),
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Store Visits (Check-ins)
CREATE TABLE IF NOT EXISTS store_visits (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36),
    salesman_id VARCHAR(36),
    visit_date DATE NOT NULL,
    notes TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (salesman_id) REFERENCES users(id)
);

-- Store Visit SKUs (Audit during visit)
CREATE TABLE IF NOT EXISTS store_visit_skus (
    id VARCHAR(36) PRIMARY KEY,
    visit_id VARCHAR(36),
    variant_id VARCHAR(36),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES store_visits(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);

-- Callsheets
CREATE TABLE IF NOT EXISTS callsheets (
    id VARCHAR(36) PRIMARY KEY,
    salesman_id VARCHAR(36),
    customer_id VARCHAR(36),
    visit_date DATE NOT NULL,
    period_start DATE,
    period_end DATE,
    round_number INT,
    remarks TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (salesman_id) REFERENCES users(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Callsheet Items
CREATE TABLE IF NOT EXISTS callsheet_items (
    id VARCHAR(36) PRIMARY KEY,
    callsheet_id VARCHAR(36),
    product_id VARCHAR(36),
    packing VARCHAR(100),
    p3 INT DEFAULT 0,
    ig INT DEFAULT 0,
    inventory_cs INT DEFAULT 0,
    inventory_pcs INT DEFAULT 0,
    suggested_order INT DEFAULT 0,
    final_order INT DEFAULT 0,
    actual INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (callsheet_id) REFERENCES callsheets(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Buyer Requests
CREATE TABLE IF NOT EXISTS buyer_requests (
    id VARCHAR(36) PRIMARY KEY,
    salesman_id VARCHAR(36),
    customer_id VARCHAR(36),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (salesman_id) REFERENCES users(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Buyer Request Items
CREATE TABLE IF NOT EXISTS buyer_request_items (
    id VARCHAR(36) PRIMARY KEY,
    request_id VARCHAR(36),
    product_id VARCHAR(36),
    quantity INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES buyer_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- AI Insights
CREATE TABLE IF NOT EXISTS ai_insights (
    id VARCHAR(36) PRIMARY KEY,
    insight_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) DEFAULT 'info',
    data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Data
INSERT IGNORE INTO roles (name) VALUES ('admin'), ('supervisor'), ('salesman'), ('buyer');

-- Seed Movement Types
INSERT IGNORE INTO inventory_movement_types (name, direction) VALUES 
('Stock In', 'in'), 
('Stock Out', 'out'), 
('Adjustment In', 'in'), 
('Adjustment Out', 'out'),
('Sale', 'out'),
('Return', 'in');

-- Create a default admin (Password: admin123)
-- Note: Replace with a properly hashed password in production
INSERT IGNORE INTO users (id, full_name, email, password_hash, role_id) 
VALUES ('system-admin-uuid-1', 'System Admin', 'admin@flowstock.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1);
