const Approval = require('../models/approval.model');
const { validationResult } = require('express-validator');

class ApprovalController {
  static async getAll(req, res) {
    try {
      const filters = {};
      
      // Apply filters based on user role
      if (req.user.role === 'user') {
        filters.user_id = req.user.id; // Users see only their requests
      }

      if (req.query.status) {
        filters.status = req.query.status;
      }

      const approvals = await Approval.findAll(filters);
      res.json({ approvals });
    } catch (error) {
      console.error('Get approvals error:', error);
      res.status(500).json({ error: 'Failed to fetch approvals' });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const approval = await Approval.findById(id);

      if (!approval) {
        return res.status(404).json({ error: 'Approval not found' });
      }

      // Check if user has permission to view this approval
      if (req.user.role === 'user' && approval.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ approval });
    } catch (error) {
      console.error('Get approval error:', error);
      res.status(500).json({ error: 'Failed to fetch approval' });
    }
  }

  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { product_name, current_price, proposed_price, justification } = req.body;

      const approval = await Approval.create({
        user_id: req.user.id,
        product_name,
        current_price,
        proposed_price,
        justification
      });

      res.status(201).json({
        message: 'Price approval request created successfully',
        approval
      });
    } catch (error) {
      console.error('Create approval error:', error);
      res.status(500).json({ error: 'Failed to create approval request' });
    }
  }

  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { product_name, current_price, proposed_price, justification } = req.body;

      // Check if approval exists and belongs to user
      const existingApproval = await Approval.findById(id);
      if (!existingApproval) {
        return res.status(404).json({ error: 'Approval not found' });
      }

      if (existingApproval.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (existingApproval.status !== 'pending') {
        return res.status(400).json({ error: 'Cannot update non-pending approval' });
      }

      const approval = await Approval.update(id, {
        product_name,
        current_price,
        proposed_price,
        justification
      });

      if (!approval) {
        return res.status(400).json({ error: 'Failed to update approval' });
      }

      res.json({
        message: 'Approval updated successfully',
        approval
      });
    } catch (error) {
      console.error('Update approval error:', error);
      res.status(500).json({ error: 'Failed to update approval' });
    }
  }

  static async approve(req, res) {
    try {
      const { id } = req.params;
      const { comments } = req.body;

      const approval = await Approval.updateStatus(
        id,
        'approved',
        req.user.id,
        comments
      );

      if (!approval) {
        return res.status(404).json({ error: 'Approval not found or already processed' });
      }

      res.json({
        message: 'Approval approved successfully',
        approval
      });
    } catch (error) {
      console.error('Approve error:', error);
      res.status(500).json({ error: 'Failed to approve request' });
    }
  }

  static async reject(req, res) {
    try {
      const { id } = req.params;
      const { comments } = req.body;

      if (!comments) {
        return res.status(400).json({ error: 'Comments required for rejection' });
      }

      const approval = await Approval.updateStatus(
        id,
        'rejected',
        req.user.id,
        comments
      );

      if (!approval) {
        return res.status(404).json({ error: 'Approval not found or already processed' });
      }

      res.json({
        message: 'Approval rejected',
        approval
      });
    } catch (error) {
      console.error('Reject error:', error);
      res.status(500).json({ error: 'Failed to reject request' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Check if approval exists and belongs to user
      const existingApproval = await Approval.findById(id);
      if (!existingApproval) {
        return res.status(404).json({ error: 'Approval not found' });
      }

      if (existingApproval.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const deleted = await Approval.delete(id);
      if (!deleted) {
        return res.status(400).json({ error: 'Cannot delete non-pending approval' });
      }

      res.json({ message: 'Approval deleted successfully' });
    } catch (error) {
      console.error('Delete approval error:', error);
      res.status(500).json({ error: 'Failed to delete approval' });
    }
  }
}

module.exports = ApprovalController;
