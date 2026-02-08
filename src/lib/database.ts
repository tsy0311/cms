import { Product } from './index';

// For now, we'll use a simple in-memory database with localStorage backup
// In production, this would connect to Supabase or another database

const DB_STORAGE_KEY = 'toy_store_db_products_v2026';

export class ProductDatabase {
  private products: Product[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(DB_STORAGE_KEY);
      if (stored) {
        this.products = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load products from storage:', error);
      this.products = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(this.products));
    } catch (error) {
      console.error('Failed to save products to storage:', error);
    }
  }

  async getAllProducts(): Promise<Product[]> {
    return [...this.products];
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.products.find(p => p.id === id) || null;
  }

  async addProduct(product: Product): Promise<Product> {
    // Check if product already exists
    const existing = this.products.find(p => p.id === product.id);
    if (existing) {
      throw new Error(`Product with id ${product.id} already exists`);
    }
    
    this.products.push(product);
    this.saveToStorage();
    return product;
  }

  async addProducts(products: Product[]): Promise<Product[]> {
    const added: Product[] = [];
    const existingIds = new Set(this.products.map(p => p.id));
    
    for (const product of products) {
      if (!existingIds.has(product.id)) {
        this.products.push(product);
        added.push(product);
        existingIds.add(product.id);
      }
    }
    
    if (added.length > 0) {
      this.saveToStorage();
    }
    
    return added;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Product with id ${id} not found`);
    }
    
    this.products[index] = { ...this.products[index], ...updates };
    this.saveToStorage();
    return this.products[index];
  }

  async deleteProduct(id: string): Promise<void> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Product with id ${id} not found`);
    }
    
    this.products.splice(index, 1);
    this.saveToStorage();
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return this.products.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
    );
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.products.filter(p => p.category === category);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return this.products.filter(p => p.isFeatured);
  }

  async replaceAllProducts(newProducts: Product[]): Promise<Product[]> {
    // Clear all existing products
    this.products = [];
    // Add new products
    this.products = [...newProducts];
    this.saveToStorage();
    return this.products;
  }
}

// Singleton instance
export const productDB = new ProductDatabase();

