require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();

// Enhanced CORS for Vercel
app.use(cors({
    origin: [
        "https://prep-pilot-sssb.vercel.app",
        "https://prep-pilot-six.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

// Handle preflight requests
app.options("*", cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic test route (works without DB)
app.get('/', (req, res) => {
    res.json({ 
        message: "PrepPilot Server is running!",
        status: "OK",
        timestamp: new Date().toISOString()
    });
});

// Health check (works without DB)
app.get('/health', (req, res) => {
    res.json({ 
        status: "OK", 
        server: "running",
        timestamp: new Date().toISOString()
    });
});

// Async function to initialize database and routes
async function initializeApp() {
    try {
        console.log("🔄 Initializing application...");
        
        // Connect to database
        await connectDB();
        console.log("✅ Database connected successfully");
        
        // Import routes after successful DB connection
        const authRoutes = require("./routes/authRoutes");
        const sessionRoutes = require("./routes/sessionRoutes");
        const questionRoutes = require("./routes/questionRoutes");
        const { protect } = require("./middlewares/authMiddleware");
        const { generateInterviewQuestions, generateConceptExplanation } = require("./controllers/aiController");

        // Apply routes
        app.use("/api/auth", authRoutes);
        app.use("/api/sessions", sessionRoutes);
        app.use("/api/questions", questionRoutes);
        app.post("/api/ai/generate-questions", protect, generateInterviewQuestions);
        app.post("/api/ai/generate-explanation", protect, generateConceptExplanation);

        // Serve uploads folder
        app.use("/uploads", express.static(path.join(__dirname, "uploads")));

        console.log("✅ All routes loaded successfully");
        
    } catch (error) {
        console.error("❌ Failed to initialize application:", error);
        
        // Provide fallback routes if DB connection fails
        app.use("/api/*", (req, res) => {
            res.status(503).json({ 
                error: "Service temporarily unavailable",
                message: "Database connection failed"
            });
        });
    }
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error("💥 Server Error:", error);
    res.status(500).json({ 
        message: "Internal server error",
        error: process.env.NODE_ENV === "production" ? undefined : error.message
    });
});

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Initialize the application
initializeApp();

const PORT = process.env.PORT || 5000;

// Start server only if this file is run directly (not in Vercel serverless)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
}

// Export for Vercel
module.exports = app;