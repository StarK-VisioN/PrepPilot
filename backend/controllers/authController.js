const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    console.log("=== REGISTRATION REQUEST STARTED ===");
    console.log("📥 Headers:", req.headers);
    console.log("📥 Request Body:", req.body);
    console.log("📥 Content-Type:", req.get('Content-Type'));
    console.log("📥 JWT Secret exists:", !!process.env.JWT_SECRET);
    
    try {
        const { name, email, password, profileImageUrl } = req.body;
        
        // Log received data
        console.log("📋 Parsed data:", { 
            name: name ? `"${name}" (length: ${name.length})` : "MISSING", 
            email: email ? `"${email}"` : "MISSING", 
            password: password ? `"***" (length: ${password.length})` : "MISSING",
            profileImageUrl: profileImageUrl || "Not provided"
        });

        // Validation
        if (!name || !email || !password) {
            console.log("❌ Validation failed - Missing fields");
            return res.status(400).json({ 
                success: false,
                message: "Please provide name, email, and password" 
            });
        }

        console.log("✅ Basic validation passed");

        // Check if user already exists
        console.log("🔍 Checking if user exists in database...");
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log("❌ User already exists with email:", email);
            return res.status(400).json({ 
                success: false,
                message: "User already exists" 
            });
        }
        console.log("✅ Email is available");

        // Hash password
        console.log("🔐 Hashing password...");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log("✅ Password hashed successfully");

        // Create new user
        console.log("👤 Creating user in database...");
        const user = await User.create({
            name, 
            email, 
            password: hashedPassword, 
            profileImageUrl: profileImageUrl || null,
        });
        console.log("✅ User created successfully:", { id: user._id, email: user.email });

        // Generate token
        console.log("🎫 Generating JWT token...");
        const token = generateToken(user._id);
        console.log("✅ Token generated");

        // Return user data with JWT
        console.log("📤 Sending success response");
        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImageUrl: user.profileImageUrl,
                token: token,
            },
            message: "Registration successful"
        });
        console.log("=== REGISTRATION COMPLETED SUCCESSFULLY ===");

    } catch (err) {
        console.error("❌ REGISTRATION ERROR:", err);
        console.error("❌ Error name:", err.name);
        console.error("❌ Error message:", err.message);
        console.error("❌ Error stack:", err.stack);
        
        // Handle specific MongoDB errors
        if (err.name === 'MongoError' || err.name === 'MongoServerError') {
            console.error("❌ MongoDB error code:", err.code);
        }
        
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false,
                message: "Validation error: " + err.message 
            });
        }

        res.status(500).json({ 
            success: false,
            message: "Server error during registration", 
            error: process.env.NODE_ENV === 'production' ? {} : err.message 
        });
        console.log("=== REGISTRATION FAILED ===");
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    console.log("=== LOGIN REQUEST STARTED ===");
    console.log("Login attempt for email:", req.body.email);
    
    try {
        const { email, password } = req.body;
        
        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: "Please provide email and password" 
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.log("Login failed: User not found");
            return res.status(401).json({ 
                success: false,
                message: "Invalid email or password" 
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Login failed: Password mismatch");
            return res.status(401).json({ 
                success: false,
                message: "Invalid email or password" 
            });
        }

        console.log("Login successful for:", email);
        
        // Return user data with JWT
        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImageUrl: user.profileImageUrl,
                token: generateToken(user._id),
            },
            message: "Login successful"
        });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ 
            success: false,
            message: "Server error during login", 
            error: process.env.NODE_ENV === 'production' ? {} : err.message 
        });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private (Requires JWT)
const getUserProfile = async (req, res) => {
    try {
        console.log("Profile request for user ID:", req.user.id);
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }
        res.json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error("Get profile error:", err);
        res.status(500).json({ 
            success: false,
            message: "Server error while fetching profile", 
            error: process.env.NODE_ENV === 'production' ? {} : err.message 
        });
    }
};

// Test function to check database connection
const testDBConnection = async (req, res) => {
    try {
        console.log("Testing database connection...");
        const userCount = await User.countDocuments();
        console.log("Database connection successful. User count:", userCount);
        res.json({ 
            success: true, 
            message: "Database connected successfully",
            userCount: userCount 
        });
    } catch (err) {
        console.error("Database connection test failed:", err);
        res.status(500).json({ 
            success: false, 
            message: "Database connection failed",
            error: err.message 
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    testDBConnection
};