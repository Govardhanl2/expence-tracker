const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Expense name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    vendor: {
      type: String,
      trim: true,
      default: 'Unknown',
      maxlength: [200, 'Vendor name cannot exceed 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Food', 'Utility', 'Subscriptions', 'Others'],
        message: '{VALUE} is not a valid category',
      },
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    invoiceFile: {
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      path: String,
    },
    aiExtracted: {
      type: Boolean,
      default: false,
    },
    currency: {
      type: String,
      default: 'USD',
      maxlength: 3,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ createdAt: -1 });

expenseSchema.virtual('formattedAmount').get(function () {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency || 'USD',
  }).format(this.amount);
});

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
