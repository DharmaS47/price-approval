const express = require('express');
const { body } = require('express-validator');
const ApprovalController = require('../controllers/approval.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation rules
const createApprovalValidation = [
  body('product_name').notEmpty().trim().withMessage('Product name is required'),
  body('current_price').isFloat({ min: 0 }).withMessage('Valid current price is required'),
  body('proposed_price').isFloat({ min: 0 }).withMessage('Valid proposed price is required'),
  body('justification').notEmpty().trim().withMessage('Justification is required')
];

const updateApprovalValidation = [
  body('product_name').optional().notEmpty().trim().withMessage('Product name cannot be empty'),
  body('current_price').optional().isFloat({ min: 0 }).withMessage('Valid current price is required'),
  body('proposed_price').optional().isFloat({ min: 0 }).withMessage('Valid proposed price is required'),
  body('justification').optional().notEmpty().trim().withMessage('Justification cannot be empty')
];

// Routes
router.get('/', ApprovalController.getAll);
router.get('/:id', ApprovalController.getById);
router.post('/', createApprovalValidation, ApprovalController.create);
router.put('/:id', updateApprovalValidation, ApprovalController.update);
router.delete('/:id', ApprovalController.delete);

// Admin/Manager only routes
router.post('/:id/approve', authorizeRoles('admin', 'manager'), ApprovalController.approve);
router.post('/:id/reject', authorizeRoles('admin', 'manager'), ApprovalController.reject);

module.exports = router;
