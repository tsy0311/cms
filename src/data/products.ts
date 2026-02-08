import { IMAGES } from "@/assets/images";
import { Product } from "@/lib/index";

export const sampleProducts: Product[] = [
  {
    id: "toy-001",
    name: "Architectural Wood Blocks",
    description: "A premium set of sustainably sourced wooden blocks designed for creative building and architectural exploration. Features geometric shapes and natural finishes.",
    price: 59.99,
    category: "Building Blocks",
    ageRange: "3-5 Years",
    image: IMAGES.TOY_COLLECTION_1,
    stock: 25,
    rating: 4.8,
    reviewsCount: 124,
    isFeatured: true,
    specifications: {
      "Material": "FSC Certified Maple",
      "Pieces": "50 distinct pieces",
      "Weight": "1.2kg",
      "Packaging": "Eco-friendly storage bag"
    }
  },
  {
    id: "toy-002",
    name: "Cuddly Organic Cotton Bunny",
    description: "Ultra-soft plush companion made from 100% organic cotton. Safe for newborns and perfect for bedtime snuggles and tactile development.",
    price: 24.50,
    category: "Plush",
    ageRange: "0-2 Years",
    image: IMAGES.TOY_COLLECTION_4,
    stock: 40,
    rating: 4.9,
    reviewsCount: 86,
    isFeatured: true,
    specifications: {
      "Material": "100% Organic Cotton",
      "Height": "30cm",
      "Washable": "Machine washable (gentle cycle)",
      "Safety": "Hypoallergenic certified"
    }
  },
  {
    id: "toy-003",
    name: "Rainbow Canvas Art Studio",
    description: "A complete arts and crafts kit with non-toxic paints, premium brushes, and textured canvases for young artists to express their creativity.",
    price: 32.00,
    category: "Arts & Crafts",
    ageRange: "6-8 Years",
    image: IMAGES.TOY_COLLECTION_5,
    stock: 15,
    rating: 4.6,
    reviewsCount: 52,
    isFeatured: false,
    specifications: {
      "Colors": "12 vibrant non-toxic shades",
      "Canvas Size": "20x20cm",
      "Safety": "ASTM D-4236 compliant",
      "Includes": "3 brushes, 4 canvases"
    }
  },
  {
    id: "toy-004",
    name: "Solar System Mechanical Model",
    description: "An interactive STEM kit that teaches children about the planets while they build a functioning mechanical solar system model powered by solar energy.",
    price: 45.00,
    category: "STEM",
    ageRange: "9-12 Years",
    image: IMAGES.EDUCATIONAL_TOYS_1,
    stock: 12,
    rating: 4.7,
    reviewsCount: 94,
    isFeatured: true,
    specifications: {
      "Power": "Dual Solar/AAA Battery system",
      "Difficulty": "Intermediate level",
      "Educational Value": "Astronomy & Physics",
      "Age": "8+ recommended"
    }
  },
  {
    id: "toy-005",
    name: "Magnetic Geometry Discovery",
    description: "A modern twist on shape recognition. Uses child-safe magnets to help toddlers learn geometry and color theory through tactile assembly.",
    price: 29.99,
    category: "Educational",
    ageRange: "3-5 Years",
    image: IMAGES.EDUCATIONAL_TOYS_2,
    stock: 30,
    rating: 4.5,
    reviewsCount: 41,
    isFeatured: false,
    specifications: {
      "Shapes": "8 unique geometric forms",
      "Safety": "BPA-free non-toxic plastic",
      "Features": "Soft-click magnetic technology",
      "Skills": "Pattern recognition"
    }
  },
  {
    id: "toy-006",
    name: "Natural Wood Counting Rings",
    description: "Vibrant wooden rings that stack to teach early numeracy and fine motor coordination. Finished with child-safe water-based organic dyes.",
    price: 18.75,
    category: "Educational",
    ageRange: "0-2 Years",
    image: IMAGES.EDUCATIONAL_TOYS_3,
    stock: 55,
    rating: 4.8,
    reviewsCount: 210,
    isFeatured: false,
    specifications: {
      "Material": "Sustainably sourced Beechwood",
      "Rings": "5 stacking rings",
      "Skills": "Fine motor, counting, logic",
      "Finish": "Water-based non-toxic dyes"
    }
  }
];