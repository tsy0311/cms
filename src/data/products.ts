import { IMAGES } from "@/assets/images";
import { Product } from "@/lib/index";

export const sampleProducts: Product[] = [
  {
    id: "product-001",
    name: "Wireless Light Pad Triangle Bra",
    description: "Comfortable wireless bra with light padding for everyday wear. Made with premium materials for ultimate comfort.",
    price: 38.00,
    category: "Bras",
    image: IMAGES.TOY_COLLECTION_1,
    stock: 25,
    rating: 4.8,
    reviewsCount: 124,
    isFeatured: true,
    specifications: {
      "Material": "Premium Cotton Blend",
      "Size": "S, M, L, XL",
      "Color": "Nude, Black, White",
      "Style": "Wireless"
    }
  },
  {
    id: "product-002",
    name: "Modal Hiphugger Panty",
    description: "Ultra-soft modal fabric panty with comfortable hiphugger fit. Perfect for everyday wear.",
    price: 28.00,
    category: "Panties",
    image: IMAGES.TOY_COLLECTION_4,
    stock: 40,
    rating: 4.9,
    reviewsCount: 86,
    isFeatured: true,
    specifications: {
      "Material": "100% Modal",
      "Size": "S, M, L, XL",
      "Color": "Assorted",
      "Style": "Hiphugger"
    }
  },
  {
    id: "product-003",
    name: "Supersoft Lounge Sweatshirt",
    description: "Comfortable loungewear sweatshirt perfect for relaxing at home. Made with supersoft fabric.",
    price: 48.00,
    category: "Homewear",
    image: IMAGES.TOY_COLLECTION_5,
    stock: 15,
    rating: 4.6,
    reviewsCount: 52,
    isFeatured: false,
    specifications: {
      "Material": "Supersoft Blend",
      "Size": "S, M, L, XL",
      "Color": "Grey, Black, Pink",
      "Style": "Relaxed Fit"
    }
  },
  {
    id: "product-004",
    name: "Seamless Light Pad Demi Bra",
    description: "Seamless design with light padding for a smooth silhouette. Perfect under any outfit.",
    price: 38.00,
    category: "Bras",
    image: IMAGES.EDUCATIONAL_TOYS_1,
    stock: 12,
    rating: 4.7,
    reviewsCount: 94,
    isFeatured: true,
    specifications: {
      "Material": "Seamless Fabric",
      "Size": "S, M, L, XL",
      "Color": "Nude, Black",
      "Style": "Demi"
    }
  },
  {
    id: "product-005",
    name: "Cotton Hipster Panty",
    description: "Comfortable cotton hipster panty with breathable fabric. Perfect for everyday comfort.",
    price: 28.00,
    category: "Panties",
    image: IMAGES.EDUCATIONAL_TOYS_2,
    stock: 30,
    rating: 4.5,
    reviewsCount: 41,
    isFeatured: false,
    specifications: {
      "Material": "100% Cotton",
      "Size": "S, M, L, XL",
      "Color": "Assorted",
      "Style": "Hipster"
    }
  },
  {
    id: "product-006",
    name: "Supersoft Lounge Pants",
    description: "Comfortable lounge pants perfect for relaxing. Made with supersoft fabric for ultimate comfort.",
    price: 48.00,
    category: "Homewear",
    image: IMAGES.EDUCATIONAL_TOYS_3,
    stock: 55,
    rating: 4.8,
    reviewsCount: 210,
    isFeatured: false,
    specifications: {
      "Material": "Supersoft Blend",
      "Size": "S, M, L, XL",
      "Color": "Grey, Black, Pink",
      "Style": "Relaxed Fit"
    }
  }
];