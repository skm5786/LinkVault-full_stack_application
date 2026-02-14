const User = require('../models/User');
const { generateToken } = require('../utils/tokenHelper');
const config = require('../config/config');

//regitstering new user
async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;

    // checking all fields present in register request
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing fields',
        message: 'Username, email and password are required'
      });
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < config.MIN_USERNAME_LENGTH || 
        trimmedUsername.length > config.MAX_USERNAME_LENGTH) {
      return res.status(400).json({
        success: false,
        error: 'Invalid username',
        message: `Username must be between ${config.MIN_USERNAME_LENGTH} and ${config.MAX_USERNAME_LENGTH} characters`
      });
    }

    // Password validation
    if (password.length < config.MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        success: false,
        error: 'Weak password',
        message: `Password must be at least ${config.MIN_PASSWORD_LENGTH} characters`
      });
    }

    // regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim();
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }

    // Check if username exists
    const existingUsername = await User.findByUsername(trimmedUsername);
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        error: 'Username taken',
        message: 'This username is already registered'
      });
    }

    // Check if email exists
    const existingEmail = await User.findByEmail(trimmedEmail);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        error: 'Email taken',
        message: 'This email is already registered'
      });
    }

    // creating user
    const userId = await User.create({ 
      username: trimmedUsername, 
      email: trimmedEmail, 
      password 
    });

    // generating token for user to store in database
    const token = generateToken({ userId, username: trimmedUsername });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: userId,
          username: trimmedUsername,
          email: trimmedEmail
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
}

// login function args: username, password
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing credentials',
        message: 'Username and password are required'
      });
    }

    // Find user - trim username
    const trimmedUsername = username.trim();
    const user = await User.findByUsername(trimmedUsername);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }

    await User.updateLastLogin(user.id);

    // Generate token
    const token = generateToken({ userId: user.id, username: user.username });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
        last_login: user.last_login
      }
    });
  } catch (error) {
    next(error);
  }
}

// logout function
function logout(req, res) {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}

module.exports = {
  register,
  login,
  getCurrentUser,
  logout
};