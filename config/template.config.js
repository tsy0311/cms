/**
 * Template Configuration File
 * Customize this file to adapt the template for different websites
 */

module.exports = {
  // Site Information
  site: {
    name: "6IXTY8IGHT",
    description: "Fun, casual fashion and lingerie for the modern woman",
    logo: "/logo.png",
    favicon: "/favicon.ico",
    contactEmail: "support@6ixty8ight.com",
    contactPhone: "+1 (555) 123-4567"
  },

  // Theme Configuration - Fashion/Lingerie Brand Colors
  theme: {
    primaryColor: "#FF6B9D", // Pink - fashion brand color
    secondaryColor: "#000000", // Black - elegant contrast
    accentColor: "#FFB6C1", // Light pink
    backgroundColor: "#FFFFFF",
    textColor: "#333333",
    fontFamily: "'Poppins', 'Helvetica Neue', sans-serif"
  },

  // E-Commerce Settings
  ecommerce: {
    currency: "USD",
    currencySymbol: "$",
    taxRate: 0.08, // 8%
    shippingCost: 5.99,
    freeShippingThreshold: 50,
    enableReviews: true,
    enableWishlist: true,
    enableCoupons: true
  },

  // Payment Gateways
  payment: {
    stripe: {
      enabled: false,
      publicKey: "",
      secretKey: ""
    },
    paypal: {
      enabled: false,
      clientId: ""
    }
  },

  // Email Configuration
  email: {
    service: "gmail", // or 'sendgrid', 'mailgun', etc.
    from: "noreply@example.com",
    adminEmail: "admin@example.com"
  },

  // Features Toggle
  features: {
    blog: true,
    newsletter: true,
    socialLogin: false,
    multiLanguage: false,
    inventoryTracking: true,
    orderTracking: true
  },

  // SEO Settings
  seo: {
    defaultTitle: "My E-Commerce Store",
    defaultDescription: "Shop the latest products",
    defaultKeywords: "ecommerce, shop, online store"
  }
};

