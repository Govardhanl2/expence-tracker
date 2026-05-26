const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const expenseController = require('../controllers/expenseController');
const upload = require('../config/multer');

const expenseValidation = [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('amount').isNumeric().withMessage('Amount must be a number').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('category').isIn(['Food', 'Utility', 'Subscriptions', 'Others']).withMessage('Invalid category'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('vendor').optional().trim(),
  body('notes').optional().trim().isLength({ max: 1000 }),
];

router.post('/upload', upload.single('invoice'), expenseController.uploadAndExtract.bind(expenseController));
router.get('/dashboard', expenseController.getDashboard.bind(expenseController));
router.get('/insights', expenseController.getInsights.bind(expenseController));
router.get('/', expenseController.getExpenses.bind(expenseController));
router.post('/', expenseValidation, expenseController.createExpense.bind(expenseController));
router.get('/:id', expenseController.getExpenseById.bind(expenseController));
router.put('/:id', expenseValidation, expenseController.updateExpense.bind(expenseController));
router.delete('/:id', expenseController.deleteExpense.bind(expenseController));

module.exports = router;
