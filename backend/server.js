require("dotenv").config();

console.log("=== SERVER STARTUP ===");
console.log("Environment:", process.env.NODE_ENV || 'development');
console.log("Port:", process.env.PORT || 8000);
console.log("MongoDB URL exists:", !!process.env.MONGO_URL);
console.log("JWT Secret exists:", !!process.env.JWT_SECRET);

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const questionRoutes = require("./routes/questionRoutes");
const { protect } = require("./middlewares/authMiddleware");
const aiController = require("./controllers/aiController");
const { testDBConnection } = require("./controllers/authController");

const app = express();

console.log("Connecting to database...");
connectDB().catch(err => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
});

console.log("Setting up CORS...");
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

console.log("Setting up body parsers...");
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

app.get('/', (req, res) => {
    res.json({ 
        message: "Server running successfully",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            health: '/health',
            dbTest: '/api/test-db',
            register: '/api/auth/register',
            login: '/api/auth/login'
        }
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        database: 'Connected', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/api/test-db', testDBConnection);

console.log("Setting up routes...");
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);

app.post("/api/ai/generate-questions", protect, aiController.generateInterviewQuestions);     
app.post("/api/ai/generate-explanation", protect, aiController.generateConceptExplanation);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
        success: false,
        message: "Route not found" 
    });
});

app.use((error, req, res, next) => {
    console.error("Global error handler:", error);
    res.status(500).json({ 
        success: false,
        message: "Internal server error", 
        error: process.env.NODE_ENV === 'production' ? {} : error.message 
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Database test: http://localhost:${PORT}/api/test-db`);
    console.log(`Registration: http://localhost:${PORT}/api/auth/register`);
    console.log("=== SERVER READY ===");
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});