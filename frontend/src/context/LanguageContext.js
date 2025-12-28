import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation keys
const translations = {
  en: {
    // Navigation
    home: 'Home',
    products: 'Products',
    cart: 'Cart',
    checkout: 'Checkout',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    account: 'Account',
    
    // Common
    search: 'Search',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    price: 'Price',
    total: 'Total',
    subtotal: 'Subtotal',
    quantity: 'Quantity',
    remove: 'Remove',
    continue: 'Continue',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    loading: 'Loading...',
    noItems: 'No items',
    emptyCart: 'Your cart is empty',
    
    // Products
    productDetails: 'Product Details',
    description: 'Description',
    specifications: 'Specifications',
    weight: 'Weight',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    selectSize: 'Select Size',
    selectColor: 'Select Color',
    
    // Checkout
    shippingAddress: 'Shipping Address',
    paymentMethod: 'Payment Method',
    placeOrder: 'Place Order',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    city: 'City',
    postalCode: 'Postal Code',
    country: 'Country',
    
    // Auth
    loginTitle: 'Login',
    registerTitle: 'Register',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    dontHaveAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    
    // Footer
    about: 'About Us',
    contact: 'Contact',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    copyright: 'All rights reserved',
    
    // Messages
    addToCartSuccess: 'Product added to cart',
    removeFromCartSuccess: 'Product removed from cart',
    orderPlaced: 'Order placed successfully',
    error: 'An error occurred',
  },
  cn: {
    // Navigation
    home: '首页',
    products: '产品',
    cart: '购物车',
    checkout: '结账',
    login: '登录',
    register: '注册',
    logout: '登出',
    account: '账户',
    
    // Common
    search: '搜索',
    addToCart: '加入购物车',
    buyNow: '立即购买',
    price: '价格',
    total: '总计',
    subtotal: '小计',
    quantity: '数量',
    remove: '删除',
    continue: '继续',
    back: '返回',
    save: '保存',
    cancel: '取消',
    edit: '编辑',
    delete: '删除',
    confirm: '确认',
    loading: '加载中...',
    noItems: '无项目',
    emptyCart: '您的购物车是空的',
    
    // Products
    productDetails: '产品详情',
    description: '描述',
    specifications: '规格',
    weight: '重量',
    inStock: '有库存',
    outOfStock: '缺货',
    selectSize: '选择尺寸',
    selectColor: '选择颜色',
    
    // Checkout
    shippingAddress: '收货地址',
    paymentMethod: '支付方式',
    placeOrder: '下单',
    name: '姓名',
    email: '邮箱',
    phone: '电话',
    address: '地址',
    city: '城市',
    postalCode: '邮政编码',
    country: '国家',
    
    // Auth
    loginTitle: '登录',
    registerTitle: '注册',
    password: '密码',
    confirmPassword: '确认密码',
    forgotPassword: '忘记密码？',
    dontHaveAccount: '没有账户？',
    haveAccount: '已有账户？',
    
    // Footer
    about: '关于我们',
    contact: '联系我们',
    privacy: '隐私政策',
    terms: '服务条款',
    copyright: '版权所有',
    
    // Messages
    addToCartSuccess: '产品已添加到购物车',
    removeFromCartSuccess: '产品已从购物车移除',
    orderPlaced: '订单下单成功',
    error: '发生错误',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to 'en'
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('language', language);
    // Update HTML lang attribute
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'cn' : 'en');
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

