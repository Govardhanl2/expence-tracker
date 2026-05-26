const { validationResult } = require('express-validator');
const expenseService = require('../services/expenseService');
const geminiService = require('../services/geminiService');
const fs = require('fs');
const path = require('path');

class ExpenseController {
  async uploadAndExtract(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const filePath = req.file.path;
      const mimetype = req.file.mimetype;

      let extractedData;
      try {
        extractedData = await geminiService.extractInvoiceData(filePath, mimetype);
      } catch (aiError) {
        fs.unlink(filePath, () => {});
        return res.status(422).json({
          success: false,
          message: 'Failed to extract data from the document',
          error: aiError.message,
        });
      }

      const expenseData = {
        ...extractedData,
        aiExtracted: true,
        invoiceFile: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
        },
      };

      const expense = await expenseService.createExpense(expenseData);

      res.status(201).json({
        success: true,
        message: 'Invoice processed and expense created successfully',
        data: expense,
      });
    } catch (error) {
      if (req.file) fs.unlink(req.file.path, () => {});
      console.error('Upload error:', error);
      res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
  }

  async createExpense(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const expense = await expenseService.createExpense(req.body);
      res.status(201).json({ success: true, message: 'Expense created', data: expense });
    } catch (error) {
      console.error('Create error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getExpenses(req, res) {
    try {
      const result = await expenseService.getAllExpenses(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Get expenses error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getExpenseById(req, res) {
    try {
      const expense = await expenseService.getExpenseById(req.params.id);
      if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
      res.json({ success: true, data: expense });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateExpense(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const expense = await expenseService.updateExpense(req.params.id, req.body);
      if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

      res.json({ success: true, message: 'Expense updated', data: expense });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteExpense(req, res) {
    try {
      const expense = await expenseService.deleteExpense(req.params.id);
      if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

      if (expense.invoiceFile?.path) {
        fs.unlink(expense.invoiceFile.path, () => {});
      }

      res.json({ success: true, message: 'Expense deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getDashboard(req, res) {
    try {
      const stats = await expenseService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getInsights(req, res) {
    try {
      const { data: allExpenses } = await expenseService.getAllExpenses({ limit: 100 });
      const insights = await geminiService.generateInsights(allExpenses.expenses || allExpenses);
      res.json({ success: true, data: insights });
    } catch (error) {
      console.error('Insights error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ExpenseController();
