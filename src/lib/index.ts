export const ROUTE_PATHS = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/product/:id',
  CART: '/cart',
  ADMIN: '/admin',
} as const;

export type Category = 'Educational' | 'Plush' | 'Building Blocks' | 'Outdoor' | 'Arts & Crafts' | 'STEM';

export type AgeRange = '0-2 Years' | '3-5 Years' | '6-8 Years' | '9-12 Years' | '13+ Years';

export const CATEGORIES: Category[] = [
  'Educational',
  'Plush',
  'Building Blocks',
  'Outdoor',
  'Arts & Crafts',
  'STEM',
];

export const AGE_RANGES: AgeRange[] = [
  '0-2 Years',
  '3-5 Years',
  '6-8 Years',
  '9-12 Years',
  '13+ Years',
];

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  ageRange: AgeRange;
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
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
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