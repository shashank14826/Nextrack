const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

// Get all transactions for a user
exports.getTransactions = async (req, res) => {
  try {
    const { accountId, type, startDate, endDate, category } = req.query;
    const query = { userId: req.user.userId };
    
    if (accountId) query.accountId = accountId;
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .populate('accountId', 'name type');
      
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

// Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { accountId, type, amount, category, description, date } = req.body;
    
    if (!accountId || !type || !amount || !category) {
      return res.status(400).json({ 
        message: 'Please provide account, type, amount, and category' 
      });
    }
    
    // Verify account belongs to user
    const account = await Account.findOne({ 
      _id: accountId, 
      userId: req.user.userId 
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    // Create transaction
    const transaction = new Transaction({
      userId: req.user.userId,
      accountId,
      type,
      amount,
      category,
      description,
      date: date || new Date()
    });
    
    // Update account balance
    if (type === 'income') {
      account.balance += amount;
      account.income += amount;
    } else {
      account.balance -= amount;
      account.expense += amount;
    }
    
    // Save both transaction and updated account
    await Promise.all([transaction.save(), account.save()]);
    
    res.status(201).json({
      transaction,
      updatedBalance: account.balance
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, description, date } = req.body;
    
    const transaction = await Transaction.findOne({ 
      _id: id, 
      userId: req.user.userId 
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    const account = await Account.findOne({ 
      _id: transaction.accountId, 
      userId: req.user.userId 
    });
    
    // Revert old transaction's effect on balance
    if (transaction.type === 'income') {
      account.balance -= transaction.amount;
      account.income -= transaction.amount;
    } else {
      account.balance += transaction.amount;
      account.expense -= transaction.amount;
    }
    
    // Apply new transaction amount
    if (amount) {
      if (transaction.type === 'income') {
        account.balance += amount;
        account.income += amount;
      } else {
        account.balance -= amount;
        account.expense += amount;
      }
      transaction.amount = amount;
    }
    
    if (category) transaction.category = category;
    if (description) transaction.description = description;
    if (date) transaction.date = date;
    
    await Promise.all([transaction.save(), account.save()]);
    
    res.json({
      transaction,
      updatedBalance: account.balance
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Error updating transaction', error: error.message });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findOne({ 
      _id: id, 
      userId: req.user.userId 
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    const account = await Account.findOne({ 
      _id: transaction.accountId, 
      userId: req.user.userId 
    });
    
    // Revert transaction's effect on balance
    if (transaction.type === 'income') {
      account.balance -= transaction.amount;
      account.income -= transaction.amount;
    } else {
      account.balance += transaction.amount;
      account.expense -= transaction.amount;
    }
    
    await Promise.all([transaction.deleteOne(), account.save()]);
    
    res.json({ 
      message: 'Transaction deleted successfully',
      updatedBalance: account.balance
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
};

// Get transaction summary
exports.getTransactionSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.user.userId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const [income, expense] = await Promise.all([
      Transaction.aggregate([
        { $match: { ...query, type: 'income' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { ...query, type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);
    
    const summary = {
      totalIncome: income[0]?.total || 0,
      totalExpense: expense[0]?.total || 0,
      netBalance: (income[0]?.total || 0) - (expense[0]?.total || 0)
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Error fetching summary', error: error.message });
  }
}; 