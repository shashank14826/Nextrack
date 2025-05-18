const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// Get all accounts for a user
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.user.userId });
    res.json(accounts);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ message: 'Error fetching accounts', error: error.message });
  }
};

// Create a new account
exports.createAccount = async (req, res) => {
  try {
    const { name, type } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ message: 'Please provide account name and type' });
    }
    
    const account = new Account({
      userId: req.user.userId,
      name,
      type
    });
    
    await account.save();
    res.status(201).json(account);
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ message: 'Error creating account', error: error.message });
  }
};

// Update an account
exports.updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    
    const account = await Account.findOne({ _id: id, userId: req.user.userId });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    if (name) account.name = name;
    if (type) account.type = type;
    
    await account.save();
    res.json(account);
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ message: 'Error updating account', error: error.message });
  }
};

// Delete an account
exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    
    const account = await Account.findOne({ _id: id, userId: req.user.userId });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    // Check if account has transactions
    const hasTransactions = await Transaction.exists({ accountId: id });
    if (hasTransactions) {
      return res.status(400).json({ 
        message: 'Cannot delete account with existing transactions. Please delete transactions first.' 
      });
    }
    
    await account.deleteOne();
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Error deleting account', error: error.message });
  }
};

// Get account balance
exports.getAccountBalance = async (req, res) => {
  try {
    const { id } = req.params;
    
    const account = await Account.findOne({ _id: id, userId: req.user.userId });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    res.json({ balance: account.balance });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Error fetching balance', error: error.message });
  }
}; 