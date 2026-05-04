const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  updateStatus,
  deleteOrder
} = require('../controllers/order.controller');
const auth = require('../middleware/auth.middleware');

router.use(auth);

router.get('/', getOrders);
router.post('/', createOrder);
router.get('/:id', getOrder);
router.put('/:id', updateOrder);
router.patch('/:id/status', updateStatus);
router.delete('/:id', deleteOrder);

module.exports = router;