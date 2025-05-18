const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const auth = require('../middleware/authMiddleware');

// All routes require authentication
router.use(auth);

// Account routes
router.get('/', accountController.getAccounts);
router.post('/', accountController.createAccount);
router.put('/:id', accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);
router.get('/:id/balance', accountController.getAccountBalance);

module.exports = router; 