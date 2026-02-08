-- Create products table for storing product information
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  stock INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 4.0,
  reviews_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  specifications JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Create index on is_featured for featured products
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);

-- Create index on name for search
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

