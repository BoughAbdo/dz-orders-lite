//backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateSettings,
  updateWhatsappTemplates,
  changePassword
} = require('../controllers/auth.controller');

const auth = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/settings', auth, updateSettings);
router.put('/whatsapp-templates', auth, updateWhatsappTemplates);
router.put('/change-password', auth, changePassword);

module.exports = router;