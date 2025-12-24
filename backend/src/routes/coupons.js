const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getCoupons,
  createCoupon
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/auth');

router.post('/validate', validateCoupon);
router.get('/', protect, admin, getCoupons);
router.post('/', protect, admin, createCoupon);

module.exports = router;



