const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateSettings
} = require('../controllers/auth.controller');

const auth = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/settings', auth, updateSettings);

module.exports = router;