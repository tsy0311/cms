export const ROUTE_PATHS = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/product/:id',
  CART: '/cart',
  ADMIN: '/admin',
  ADMIN_LOGIN: '/admin/login',
} as const;

export type Category = 'Bras' | 'Panties' | 'Homewear' | 'Clothing' | 'Accessories' | 'Combo Deals';

export const CATEGORIES: Category[] = [
  'Bras',
  'Panties',
  'Homewear',
  'Clothing',
  'Accessories',
  'Combo Deals',
];

// Currency conversion: 1 CNY = 0.65 MYR (approximate)
export const CNY_TO_MYR_RATE = 0.65;

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Price in MYR (Malaysian Ringgit)
  category: Category;
  image: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  isFeatured?: boolean;
  specifications?: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

// Convert Chinese Yuan (CNY) to Malaysian Ringgit (MYR)
export function convertCNYToMYR(cnyPrice: number): number {
  return parseFloat((cnyPrice * CNY_TO_MYR_RATE).toFixed(2));
}

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
}

export const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};