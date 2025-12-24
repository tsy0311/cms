/**
 * Seed script to populate database with dummy data matching Adam Malaysia website
 * Run: node backend/src/utils/seedData.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cms_ecommerce';

// Categories matching Adam Malaysia website
const categories = [
  {
    name: 'For Man',
    slug: 'for-man',
    description: 'Adult toys and products designed for men',
    isActive: true,
    order: 1
  },
  {
    name: 'For Women',
    slug: 'for-women',
    description: 'Adult toys and products designed for women',
    isActive: true,
    order: 2
  },
  {
    name: 'Sex Doll',
    slug: 'sex-doll',
    description: '6D Hyper-Real Dolls and realistic companions',
    isActive: true,
    order: 3
  },
  {
    name: 'For Couple',
    slug: 'for-couple',
    description: 'Products for couples to enjoy together',
    isActive: true,
    order: 4
  },
  {
    name: 'Homo & BDSM',
    slug: 'homo-bdsm',
    description: 'BDSM gear and specialty products',
    isActive: true,
    order: 5
  },
  {
    name: 'Adam Penis Pump',
    slug: 'adam-penis-pump',
    description: 'ADAM Penis Pump collection',
    isActive: true,
    order: 6
  },
  {
    name: 'Lingerie',
    slug: 'lingerie',
    description: 'Elegant and comfortable lingerie collection',
    isActive: true,
    order: 7
  }
];

// Helper function to generate random number in range
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Products matching Adam Malaysia website
const getProducts = (categoryIds) => {
  // categoryIds[0] = For Man
  // categoryIds[1] = For Women
  // categoryIds[2] = Sex Doll
  // categoryIds[3] = For Couple
  // categoryIds[4] = Homo & BDSM
  // categoryIds[5] = Adam Penis Pump
  // categoryIds[6] = Lingerie

  return [
    // FOR MAN categoryIds[0]
    {
      name: 'ADAM Superman',
      slug: 'adam-superman',
      description: '6 feature in 1 - Advanced multi-function adult toy for men. Realistic design with multiple stimulation modes.',
      shortDescription: '6 feature in 1',
      price: 188.20,
      compareAtPrice: null,
      sku: 'ADAM-SUPERMAN-001',
      category: categoryIds[0],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=ADAM+Superman', alt: 'ADAM Superman' }],
      stock: 50,
      sizes: [],
      colors: [],
      status: 'active',
      featured: true,
      reviewCount: 80,
      averageRating: 4.5,
      soldCount: 1400,
      tags: ['superman', 'multi-function', 'men']
    },
    {
      name: 'ADAM Auto Men Sex Toy',
      slug: 'adam-auto-men-sex-toy',
      description: 'Auto Sex Toy with intelligent motion control. Hands-free operation with realistic sensations.',
      shortDescription: 'Auto Sex Toy',
      price: 188.20,
      compareAtPrice: null,
      sku: 'ADAM-AUTO-001',
      category: categoryIds[0],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=ADAM+Auto', alt: 'ADAM Auto Men Sex Toy' }],
      stock: 45,
      sizes: [],
      colors: [],
      status: 'active',
      featured: true,
      reviewCount: 28,
      averageRating: 4.3,
      soldCount: 1000,
      tags: ['auto', 'hands-free', 'men']
    },
    {
      name: 'ADAM Puxxy Vibrator for man',
      slug: 'adam-puxxy-vibrator-for-man',
      description: 'REALISTIC TOUCH - Premium material that feels incredibly realistic. Compact design for easy use.',
      shortDescription: 'REALISTIC TOUCH',
      price: 72.10,
      compareAtPrice: null,
      sku: 'ADAM-PUXXY-001',
      category: categoryIds[0],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=ADAM+Puxxy', alt: 'ADAM Puxxy Vibrator' }],
      stock: 60,
      sizes: [],
      colors: [],
      status: 'active',
      featured: true,
      reviewCount: 111,
      averageRating: 4.6,
      soldCount: 1500,
      tags: ['puxxy', 'realistic', 'vibrator']
    },
    {
      name: 'Adam Puxxy Japan',
      slug: 'adam-puxxy-japan',
      description: 'Super SOFT and TENDERlike - Premium Japanese design with ultra-soft material.',
      shortDescription: 'Super SOFT and TENDERlike',
      price: 37.30,
      compareAtPrice: null,
      sku: 'ADAM-PUXXY-JP-001',
      category: categoryIds[0],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=Puxxy+Japan', alt: 'Adam Puxxy Japan' }],
      stock: 75,
      sizes: [],
      colors: [],
      status: 'active',
      featured: false,
      reviewCount: 55,
      averageRating: 4.4,
      soldCount: 1800,
      tags: ['japan', 'soft', 'premium']
    },
    {
      name: 'ADAM CrazyBull',
      slug: 'adam-crazybull',
      description: '5D design which almost 100% real - Ultra-realistic design with advanced texture technology.',
      shortDescription: '5D design which almost 100% real',
      price: 142.10,
      compareAtPrice: null,
      sku: 'ADAM-CRAZYBULL-001',
      category: categoryIds[0],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=CrazyBull', alt: 'ADAM CrazyBull' }],
      stock: 40,
      sizes: [],
      colors: [],
      status: 'active',
      featured: true,
      reviewCount: 139,
      averageRating: 4.7,
      soldCount: 1600,
      tags: ['5d', 'realistic', 'premium']
    },
    {
      name: 'ADAM Gold Cup',
      slug: 'adam-gold-cup',
      description: '90% like REAL - Premium gold series with exceptional quality and realism.',
      shortDescription: '90% like REAL',
      price: 112.00,
      compareAtPrice: null,
      sku: 'ADAM-GOLDCUP-001',
      category: categoryIds[0],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=Gold+Cup', alt: 'ADAM Gold Cup' }],
      stock: 35,
      sizes: [],
      colors: [],
      status: 'active',
      featured: false,
      reviewCount: 29,
      averageRating: 4.2,
      soldCount: 1000,
      tags: ['gold', 'premium', 'realistic']
    },

    // FOR WOMEN categoryIds[1]
    {
      name: 'ADAM G-Spot Master',
      slug: 'adam-g-spot-master',
      description: 'No.1 recommended - Designed for precise G-spot stimulation with ergonomic curved design.',
      shortDescription: 'No.1 recommended',
      price: 78.20,
      compareAtPrice: null,
      sku: 'ADAM-GSPOT-001',
      category: categoryIds[1],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=G-Spot+Master', alt: 'ADAM G-Spot Master' }],
      stock: 80,
      sizes: [],
      colors: [],
      status: 'active',
      featured: true,
      reviewCount: 231,
      averageRating: 4.8,
      soldCount: 1800,
      tags: ['g-spot', 'recommended', 'women']
    },
    {
      name: 'Adam Japan AV wand vibrator',
      slug: 'adam-japan-av-wand-vibrator',
      description: 'Powerful Vibration - Japanese design with strong, rumbling vibrations. Perfect for external stimulation.',
      shortDescription: 'Powerful Vibration',
      price: 35.20,
      compareAtPrice: null,
      sku: 'ADAM-WAND-JP-001',
      category: categoryIds[1],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=AV+Wand', alt: 'Adam Japan AV wand vibrator' }],
      stock: 65,
      sizes: [],
      colors: [],
      status: 'active',
      featured: false,
      reviewCount: 44,
      averageRating: 4.4,
      soldCount: 1200,
      tags: ['wand', 'vibrator', 'powerful']
    },
    {
      name: 'Adam Licking Rose Vibrator',
      slug: 'adam-licking-rose-vibrator',
      description: '10 Versatile Pleasure - Beautiful rose design with licking and vibrating functions. Multi-stimulation toy.',
      shortDescription: '10 Versatile Pleasure',
      price: 59.60,
      compareAtPrice: null,
      sku: 'ADAM-ROSE-LICK-001',
      category: categoryIds[1],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=Licking+Rose', alt: 'Adam Licking Rose Vibrator' }],
      stock: 55,
      sizes: [],
      colors: [],
      status: 'active',
      featured: true,
      reviewCount: 139,
      averageRating: 4.6,
      soldCount: 1600,
      tags: ['rose', 'licking', 'versatile']
    },
    {
      name: 'Adam Suction Rose Vibrator',
      slug: 'adam-suction-rose-vibrator',
      description: '10 Versatile Pleasure - Elegant rose design with suction technology. Multiple intensity levels.',
      shortDescription: '10 Versatile Pleasure',
      price: 59.80,
      compareAtPrice: null,
      sku: 'ADAM-ROSE-SUC-001',
      category: categoryIds[1],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=Suction+Rose', alt: 'Adam Suction Rose Vibrator' }],
      stock: 50,
      sizes: [],
      colors: [],
      status: 'active',
      featured: false,
      reviewCount: 44,
      averageRating: 4.5,
      soldCount: 1200,
      tags: ['rose', 'suction', 'versatile']
    },
    {
      name: 'Adam GCV Vibrator',
      slug: 'adam-gcv-vibrator',
      description: 'No.1 recommended - G-spot, Clitoral, and Vaginal triple stimulation. Advanced design for ultimate pleasure.',
      shortDescription: 'No.1 recommended',
      price: 147.20,
      compareAtPrice: null,
      sku: 'ADAM-GCV-001',
      category: categoryIds[1],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=GCV+Vibrator', alt: 'Adam GCV Vibrator' }],
      stock: 40,
      sizes: [],
      colors: [],
      status: 'active',
      featured: true,
      reviewCount: 210,
      averageRating: 4.7,
      soldCount: 2500,
      tags: ['gcv', 'triple', 'recommended']
    },
    {
      name: 'Adam wireless Bluetooth vibrator',
      slug: 'adam-wireless-bluetooth-vibrator',
      description: 'Control by phone app - Bluetooth enabled vibrator with app control. Long-distance control available.',
      shortDescription: 'Control by phone app',
      price: 108.20,
      compareAtPrice: null,
      sku: 'ADAM-BT-001',
      category: categoryIds[1],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=Bluetooth+Vibe', alt: 'Adam wireless Bluetooth vibrator' }],
      stock: 30,
      sizes: [],
      colors: [],
      status: 'active',
      featured: false,
      reviewCount: 44,
      averageRating: 4.3,
      soldCount: 1000,
      tags: ['bluetooth', 'app', 'wireless']
    },
    {
      name: 'ADAM Smart Vibrator',
      slug: 'adam-smart-vibrator',
      description: 'Stable and fast response - Smart vibrator with multiple patterns and intensity levels.',
      shortDescription: 'Stable and fast response',
      price: 38.20,
      compareAtPrice: null,
      sku: 'ADAM-SMART-001',
      category: categoryIds[1],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=Smart+Vibe', alt: 'ADAM Smart Vibrator' }],
      stock: 70,
      sizes: [],
      colors: [],
      status: 'active',
      featured: false,
      reviewCount: 80,
      averageRating: 4.4,
      soldCount: 1400,
      tags: ['smart', 'patterns', 'versatile']
    },
    {
      name: 'Adam Double Egg Vibrator',
      slug: 'adam-double-egg-vibrator',
      description: 'Medical grade ABS - Double egg design for internal and external stimulation. Waterproof and body-safe.',
      shortDescription: 'Medical grade ABS',
      price: 10.90,
      compareAtPrice: null,
      sku: 'ADAM-EGG-001',
      category: categoryIds[1],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=Double+Egg', alt: 'Adam Double Egg Vibrator' }],
      stock: 100,
      sizes: [],
      colors: [],
      status: 'active',
      featured: true,
      reviewCount: 180,
      averageRating: 4.5,
      soldCount: 2600,
      tags: ['egg', 'double', 'medical-grade']
    },

    // SEX DOLL categoryIds[2]
    {
      name: 'ADAM SexyV 6D',
      slug: 'adam-sexyv-6d',
      description: '🔥 Nano Skin 6D Ultra Real - Premium 6D sex doll with nano skin technology. Ultra-realistic feel and appearance.',
      shortDescription: '🔥 Nano Skin 6D Ultra Real',
      price: 258.20,
      compareAtPrice: 338.20,
      sku: 'ADAM-6D-SEXYV-001',
      category: categoryIds[2],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=SexyV+6D', alt: 'ADAM SexyV 6D' }],
      stock: 15,
      sizes: [],
      colors: [],
      status: 'active',
      featured: true,
      reviewCount: 139,
      averageRating: 4.6,
      soldCount: 1600,
      tags: ['6d', 'nano-skin', 'ultra-real']
    },
    {
      name: 'ADAM Sexy Hips 5D',
      slug: 'adam-sexy-hips-5d',
      description: 'REALISTIC TOUCH - 5D realistic hips with lifelike texture and feel. Compact design.',
      shortDescription: 'REALISTIC TOUCH',
      price: 79.80,
      compareAtPrice: 139.30,
      sku: 'ADAM-HIPS-5D-001',
      category: categoryIds[2],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=Sexy+Hips+5D', alt: 'ADAM Sexy Hips 5D' }],
      stock: 25,
      sizes: [],
      colors: [],
      status: 'active',
      featured: false,
      reviewCount: 56,
      averageRating: 4.4,
      soldCount: 1100,
      tags: ['5d', 'hips', 'realistic']
    },
    {
      name: 'ADAM Double Men 5D',
      slug: 'adam-double-men-5d',
      description: '5D design which almost 100% real - Double-sided design with ultra-realistic 5D material.',
      shortDescription: '5D design which almost 100% real',
      price: 75.20,
      compareAtPrice: null,
      sku: 'ADAM-DOUBLE-5D-001',
      category: categoryIds[2],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=Double+Men+5D', alt: 'ADAM Double Men 5D' }],
      stock: 30,
      sizes: [],
      colors: [],
      status: 'active',
      featured: false,
      reviewCount: 101,
      averageRating: 4.5,
      soldCount: 1600,
      tags: ['5d', 'double', 'realistic']
    },
    {
      name: 'ADAM Sexy Body XS',
      slug: 'adam-sexy-body-xs',
      description: 'TPE NANOSKIN 6D - Compact body with 6D nano skin technology. Smaller size, same quality.',
      shortDescription: 'TPE NANOSKIN 6D',
      price: 83.20,
      compareAtPrice: null,
      sku: 'ADAM-BODY-XS-001',
      category: categoryIds[2],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=Body+XS', alt: 'ADAM Sexy Body XS' }],
      stock: 20,
      sizes: [],
      colors: [],
      status: 'active',
      featured: false,
      reviewCount: 29,
      averageRating: 4.3,
      soldCount: 1000,
      tags: ['6d', 'xs', 'compact']
    },
    {
      name: 'ADAM Sexy Body 6D',
      slug: 'adam-sexy-body-6d',
      description: '🔥 TPE NANOSKIN 6D - Full body 6D sex doll with premium nano skin technology.',
      shortDescription: '🔥 TPE NANOSKIN 6D',
      price: 248.20,
      compareAtPrice: 388.20,
      sku: 'ADAM-BODY-6D-001',
      category: categoryIds[2],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=Body+6D', alt: 'ADAM Sexy Body 6D' }],
      stock: 12,
      sizes: [],
      colors: [],
      status: 'active',
      featured: true,
      reviewCount: 44,
      averageRating: 4.7,
      soldCount: 1200,
      tags: ['6d', 'full-body', 'nano-skin']
    },
    {
      name: 'ADAM SexyV SE 6D',
      slug: 'adam-sexyv-se-6d',
      description: '🔥 Nano Skin 6D Ultra Real - Special edition with enhanced features and premium quality.',
      shortDescription: '🔥 Nano Skin 6D Ultra Real',
      price: 123.20,
      compareAtPrice: null,
      sku: 'ADAM-6D-SE-001',
      category: categoryIds[2],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=SexyV+SE+6D', alt: 'ADAM SexyV SE 6D' }],
      stock: 18,
      sizes: [],
      colors: [],
      status: 'active',
      featured: false,
      reviewCount: 37,
      averageRating: 4.5,
      soldCount: 1400,
      tags: ['6d', 'special-edition', 'premium']
    },

    // FOR COUPLE categoryIds[3]
    {
      name: 'Adam Smooth Strawberry lubricant 120ml',
      slug: 'adam-smooth-strawberry-lubricant-120ml',
      description: 'Flavoured and intimate lube - Water-based lubricant with strawberry flavor. Safe and body-friendly.',
      shortDescription: 'Flavoured and intimate lube',
      price: 11.30,
      compareAtPrice: null,
      sku: 'ADAM-LUBE-STRAW-001',
      category: categoryIds[3],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=Strawberry+Lube', alt: 'Adam Smooth Strawberry lubricant' }],
      stock: 200,
      sizes: [],
      colors: [],
      status: 'active',
      featured: false,
      reviewCount: 139,
      averageRating: 4.5,
      soldCount: 1600,
      tags: ['lubricant', 'strawberry', 'flavored']
    },
    {
      name: 'Adam Smooth Lubricant 120ml',
      slug: 'adam-smooth-lubricant-120ml',
      description: 'No.1 selling personal lubricant - Premium water-based lubricant. Long-lasting and silky smooth.',
      shortDescription: 'No.1 selling personal lubricant',
      price: 9.90,
      compareAtPrice: null,
      sku: 'ADAM-LUBE-001',
      category: categoryIds[3],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=Smooth+Lube', alt: 'Adam Smooth Lubricant' }],
      stock: 300,
      sizes: [],
      colors: [],
      status: 'active',
      featured: true,
      reviewCount: 630,
      averageRating: 4.8,
      soldCount: 5200,
      tags: ['lubricant', 'best-seller', 'smooth']
    },
    {
      name: 'Adam Smooth Lubricant 120ml x2',
      slug: 'adam-smooth-lubricant-120ml-x2',
      description: 'No.1 selling personal lubricant - Two-pack value bundle. Same premium quality.',
      shortDescription: 'No.1 selling personal lubricant',
      price: 19.50,
      compareAtPrice: null,
      sku: 'ADAM-LUBE-2PK-001',
      category: categoryIds[3],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=Lube+2Pack', alt: 'Adam Smooth Lubricant x2' }],
      stock: 150,
      sizes: [],
      colors: [],
      status: 'active',
      featured: false,
      reviewCount: 80,
      averageRating: 4.6,
      soldCount: 1400,
      tags: ['lubricant', 'bundle', 'value']
    },
    {
      name: 'ADAM Smooth 7ml',
      slug: 'adam-smooth-7ml',
      description: 'Intimate lube - Travel size lubricant. Perfect for on-the-go.',
      shortDescription: 'Intimate lube',
      price: 0.27,
      compareAtPrice: null,
      sku: 'ADAM-LUBE-7ML-001',
      category: categoryIds[3],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=Smooth+7ml', alt: 'ADAM Smooth 7ml' }],
      stock: 500,
      sizes: [],
      colors: [],
      status: 'active',
      featured: false,
      reviewCount: 80,
      averageRating: 4.4,
      soldCount: 1400,
      tags: ['lubricant', 'travel', 'sample']
    },
    {
      name: 'Adam Penis Ring',
      slug: 'adam-penis-ring',
      description: 'Soft & super elastic - Flexible penis ring for enhanced pleasure. Body-safe silicone.',
      shortDescription: 'Soft & super elastic',
      price: 9.90,
      compareAtPrice: null,
      sku: 'ADAM-RING-001',
      category: categoryIds[3],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=Penis+Ring', alt: 'Adam Penis Ring' }],
      stock: 180,
      sizes: [],
      colors: [],
      status: 'active',
      featured: false,
      reviewCount: 83,
      averageRating: 4.5,
      soldCount: 2500,
      tags: ['penis-ring', 'couple', 'enhancement']
    },
    {
      name: 'ADAM Condom Dragon',
      slug: 'adam-condom-dragon',
      description: '5D surface - Premium condoms with textured surface for enhanced sensation.',
      shortDescription: '5D surface',
      price: 45.20,
      compareAtPrice: null,
      sku: 'ADAM-CONDOM-DRAGON-001',
      category: categoryIds[3],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=Condom+Dragon', alt: 'ADAM Condom Dragon' }],
      stock: 120,
      sizes: [],
      colors: [],
      status: 'active',
      featured: false,
      reviewCount: 210,
      averageRating: 4.6,
      soldCount: 1900,
      tags: ['condom', 'textured', 'premium']
    },
    {
      name: 'ADAM Condom Rocket',
      slug: 'adam-condom-rocket',
      description: 'Safe silicone material - Premium condoms with smooth surface. Ultra-thin for maximum sensitivity.',
      shortDescription: 'Safe silicone material',
      price: 52.10,
      compareAtPrice: null,
      sku: 'ADAM-CONDOM-ROCKET-001',
      category: categoryIds[3],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=Condom+Rocket', alt: 'ADAM Condom Rocket' }],
      stock: 100,
      sizes: [],
      colors: [],
      status: 'active',
      featured: false,
      reviewCount: 139,
      averageRating: 4.5,
      soldCount: 1600,
      tags: ['condom', 'ultra-thin', 'premium']
    },

    // LINGERIE categoryIds[6]
    {
      name: 'Lace Bralette Set - Black',
      slug: 'lace-bralette-set-black',
      description: 'Beautiful black lace bralette set with matching panties. Made from soft, stretchy lace material for ultimate comfort and style.',
      shortDescription: 'Elegant black lace bralette set',
      price: 89.90,
      compareAtPrice: 129.90,
      sku: 'LING-001-BLK',
      category: categoryIds[6],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=Lace+Bralette', alt: 'Lace Bralette Set Black' }],
      stock: 50,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [{ name: 'Black', hex: '#000000' }, { name: 'Red', hex: '#DC143C' }, { name: 'Nude', hex: '#F5E6D3' }],
      status: 'active',
      featured: true,
      reviewCount: 45,
      averageRating: 4.6,
      soldCount: 320,
      tags: ['lingerie', 'lace', 'set', 'black']
    },
    {
      name: 'Silk Camisole - Rose',
      slug: 'silk-camisole-rose',
      description: 'Luxurious silk camisole in a beautiful rose color. Soft, smooth fabric that feels amazing against the skin.',
      shortDescription: 'Luxurious rose silk camisole',
      price: 79.90,
      compareAtPrice: 99.90,
      sku: 'LING-002-ROS',
      category: categoryIds[6],
      images: [{ url: 'https://placehold.co/500x500/000000/FFFFFF?text=Silk+Camisole', alt: 'Silk Camisole Rose' }],
      stock: 40,
      sizes: ['S', 'M', 'L'],
      colors: [{ name: 'Rose', hex: '#FFB6C1' }, { name: 'Ivory', hex: '#FFFFF0' }, { name: 'Black', hex: '#000000' }],
      status: 'active',
      featured: true,
      reviewCount: 38,
      averageRating: 4.7,
      soldCount: 280,
      tags: ['camisole', 'silk', 'rose', 'luxury']
    }
  ];
};

// Sample coupons
const coupons = [
  {
    code: 'WELCOME10',
    description: 'Welcome discount for new customers',
    discountType: 'percentage',
    discountValue: 10,
    minPurchase: 0,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    usageLimit: null,
    isActive: true
  },
  {
    code: 'SHOP50',
    description: 'Free shipping on orders over RM200',
    discountType: 'fixed',
    discountValue: 10,
    minPurchase: 200,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    usageLimit: null,
    isActive: true
  }
];

// Sample test customer
const testCustomer = {
  name: 'Test Customer',
  email: 'test@example.com',
  password: 'test123',
  role: 'customer'
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create categories
    console.log('📁 Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories\n`);

    // Create products
    console.log('🛍️  Creating products...');
    const categoryIds = createdCategories.map(cat => cat._id);
    const productsWithCategories = getProducts(categoryIds);
    const createdProducts = await Product.insertMany(productsWithCategories);
    console.log(`✅ Created ${createdProducts.length} products\n`);

    // Create coupons
    console.log('🎫 Creating coupons...');
    const createdCoupons = await Coupon.insertMany(coupons);
    console.log(`✅ Created ${createdCoupons.length} coupons\n`);

    // Create test customer (if doesn't exist)
    console.log('👤 Creating test customer...');
    const existingCustomer = await User.findOne({ email: testCustomer.email });
    if (!existingCustomer) {
      await User.create(testCustomer);
      console.log('✅ Test customer created');
      console.log('   Email: test@example.com');
      console.log('   Password: test123\n');
    } else {
      console.log('ℹ️  Test customer already exists\n');
    }

    console.log('========================================');
    console.log('🎉 Database seeding completed!');
    console.log('========================================');
    console.log(`📁 Categories: ${createdCategories.length}`);
    console.log(`🛍️  Products: ${createdProducts.length}`);
    console.log(`🎫 Coupons: ${createdCoupons.length}`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
