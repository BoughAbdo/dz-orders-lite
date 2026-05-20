// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateSettings,
  updateWhatsappTemplates,
  changePassword,
  verifyEmail,
  resendVerificationCode
} = require('../controllers/auth.controller');

const auth = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification-code', resendVerificationCode);

router.get('/me', auth, getMe);
router.put('/settings', auth, updateSettings);
router.put('/whatsapp-templates', auth, updateWhatsappTemplates);
router.put('/change-password', auth, changePassword);

module.exports = router;