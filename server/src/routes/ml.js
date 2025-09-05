const express = require('express');
const mlController = require('../controllers/mlController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { mlQuerySchema } = require('../utils/validator');

const router = express.Router();

// All ML routes are protected
router.use(authMiddleware);

// Route to query the AI assistant
router.post('/query', validate(mlQuerySchema), mlController.queryAssistant);

module.exports = router;