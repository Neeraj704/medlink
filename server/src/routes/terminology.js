const express = require('express');
const terminologyController = require('../controllers/terminologyController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected route to ensure only logged-in users can search
router.get('/search', authMiddleware, terminologyController.searchTerminology);

module.exports = router;