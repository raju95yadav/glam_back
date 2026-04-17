const express = require('express');
const {
  subscribeNewsletter,
  getSupportContent,
  getJobs,
  submitContactForm,
  getAdminContact
} = require('../controllers/mainController');

const router = express.Router();

router.post('/newsletter', subscribeNewsletter);
router.get('/support/:type', getSupportContent);
router.get('/jobs', getJobs);
router.post('/contact', submitContactForm);
router.get('/admin-contact', getAdminContact);

module.exports = router;
