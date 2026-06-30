require("dotenv").config();

console.log("=== SERVER STARTUP ===");
console.log("Environment:", process.env.NODE_ENV || 'development');
console.log("Port:", process.env.PORT || 8000);
console.log("MongoDB URL exists:", !!process.env.MONGO_URL);
console.log("JWT Secret exists:", !!process.env.JWT_SECRET);
console.log("Groq API key exists:", !!process.env.GROQ_API_KEY);
console.log("Groq model:", process.env.GROQ_MODEL || "llama-3.3-70b-versatile");

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const questionRoutes = require("./routes/questionRoutes");
const documentRoutes = require("./routes/documentRoutes");
const companyRoutes = require("./routes/companyRoutes");
const { protect } = require("./middlewares/authMiddleware");
const aiController = require("./controllers/aiController");

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.FRONTEND_URL,
].filter(Boolean);

const isDev = (process.env.NODE_ENV || "development") !== "production";

function isAllowedOrigin(origin) {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;
    if (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return true;
    }
    return false;
}

// Middleware 
console.log("Setting up CORS...");
app.use(cors({
    origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

console.log("Setting up body parsers...");
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// Routes 
app.get('/', (req, res) => {
    res.json({ 
        message: "Server running successfully",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            health: '/health',
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

console.log("Setting up routes...");
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/companies", companyRoutes);

app.post("/api/ai/generate-questions", protect, aiController.generateInterviewQuestions);     
app.post("/api/ai/generate-explanation", protect, aiController.generateConceptExplanation);
app.post("/api/ai/generate-topic-questions", protect, aiController.generateTopicQuestions);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Error Handling 
app.use((req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
        success: false,
        message: "Route not found" 
    });
});

app.use((error, req, res, next) => {
    console.error("Global error handler:", error);

    if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File size must be under 5MB" });
    }

    if (error.message && error.message.includes("Only PDF")) {
        return res.status(400).json({ success: false, message: error.message });
    }

    if (
        error.message &&
        (error.message.includes("Only JPEG") ||
            error.message.includes("CORS") ||
            error.message.includes("PDF") ||
            error.message.includes("DOCX"))
    ) {
        return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ 
        success: false,
        message: "Internal server error", 
        error: process.env.NODE_ENV === 'production' ? {} : error.message 
    });
});

// Start Server Only After DB Connect 
const PORT = process.env.PORT || 8000;

const startServer = async () => {
    try {
        console.log("Connecting to database...");
        await connectDB(); // Wait for DB connection

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
            console.log(`Registration: http://localhost:${PORT}/api/auth/register`);
            console.log("=== SERVER READY ===");
        });

    } catch (err) {
        console.error("Failed to connect to database:", err);
        process.exit(1);
    }
};

startServer();

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
