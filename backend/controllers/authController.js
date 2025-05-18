const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');
const bcrypt = require('bcryptjs');

// Register a new user
exports.signup = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Account already exists with this email address. Please sign in instead or use a different email.' 
      });
    }
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide all required information: name, email, and password to create your account.' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long for your security.' 
      });
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
      phoneNumber: phoneNumber || ''
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber
      },
      message: 'Account created successfully! Welcome to AuthApp. You are now logged in.'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      message: 'Something went wrong during registration. Please check your information and try again later.', 
      error: error.message 
    });
  }
};

// Login user
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please provide both email and password to sign in to your account.' 
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        message: 'Incorrect username or email address. No account found with these credentials. Please check and try again or create a new account.' 
      });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Incorrect password. Please try again or use the forgot password option if you cannot remember your password.' 
      });
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber
      },
      message: `Welcome back, ${user.name}! You have successfully signed in to your account.`
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ 
      message: 'Something went wrong during sign in. Please check your network connection and try again later.', 
      error: error.message 
    });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found. Your account may have been deleted or deactivated. Please contact support.' 
      });
    }
    
    res.json({
      user,
      message: 'Profile retrieved successfully.'
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Could not retrieve your profile. Please check your session and try again later.', 
      error: error.message 
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        message: 'Please provide your email address to reset your password.' 
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        message: 'No account found with this email address. Please check the spelling and try again or create a new account.' 
      });
    }
    
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 8);
    
    // Update user password
    user.password = hashedPassword;
    await user.save();
    
    // In a real application, send email with tempPassword
    // For demo purposes, we'll just return it in the response
    res.json({ 
      message: 'Password reset successful! Use your new temporary password to sign in. Please change it after logging in for security.',
      tempPassword, // In a real app, don't return this, send via email
      note: 'In a production app, this would be sent via email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      message: 'Something went wrong during password reset. Please try again later or contact support if the problem persists.', 
      error: error.message 
    });
  }
};

// Sign out - client side implementation
// We'll add this function for completeness, even though JWT typically handles this client-side
exports.signout = (req, res) => {
  try {
    // JWT tokens are stateless, so we just return a success message
    // The actual token invalidation is handled client-side by removing the token
    res.json({ 
      message: 'You have been successfully signed out. Thank you for using AuthApp!'
    });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ 
      message: 'Something went wrong during sign out. Please try again.',
      error: error.message 
    });
  }
}; 