require("dotenv").config();

console.log("=== SERVER STARTUP ===");
console.log("Environment:", process.env.NODE_ENV || 'development');
console.log("Port:", process.env.PORT || 8000);
console.log("MongoDB URL exists:", !!process.env.MONGO_URL);
console.log("JWT Secret exists:", !!process.env.JWT_SECRET);
console.log("Groq API key exists:", !!process.env.GROQ_API_KEY);
console.log("Groq model:", process.env.GROQ_MODEL || "llama-3.3-70b-versatile");

const { initRedis, isRedisAvailable } = require("./config/redis");
const { logRedisStartupSummary } = require("./utils/redisDebug");

initRedis();
console.log("Redis enabled:", isRedisAvailable());
logRedisStartupSummary({
    redisEnabled: isRedisAvailable(),
    upstashUrlConfigured: Boolean(process.env.UPSTASH_REDIS_REST_URL),
});
console.log("AI daily limit:", process.env.AI_DAILY_LIMIT || "20");

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const questionRoutes = require("./routes/questionRoutes");
const documentRoutes = require("./routes/documentRoutes");
const companyRoutes = require("./routes/companyRoutes");
const debugRoutes = require("./routes/debugRoutes");
const { protect } = require("./middlewares/authMiddleware");
const aiRateLimitMiddleware = require("./middlewares/aiRateLimitMiddleware");
const aiController = require("./controllers/aiController");

const app = express();

const isDev = (process.env.NODE_ENV || "development") !== "production";

function buildAllowedOrigins() {
    const origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://prep-pilot-sssb.vercel.app",
        process.env.FRONTEND_URL,
    ];

    if (process.env.ALLOWED_ORIGINS) {
        origins.push(
            ...process.env.ALLOWED_ORIGINS.split(",")
                .map((value) => value.trim())
                .filter(Boolean)
        );
    }

    return [...new Set(origins.filter(Boolean))];
}

const allowedOrigins = buildAllowedOrigins();

console.log("FRONTEND_URL:", process.env.FRONTEND_URL || "(not set)");
console.log("CORS allowed origins:", allowedOrigins.join(", ") || "(none)");

function isAllowedOrigin(origin) {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;
    if (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return true;
    }
    return false;
}

const corsOptions = {
    origin(origin, callback) {
        console.log(`CORS check — incoming origin: ${origin || "(none)"}`);

        if (isAllowedOrigin(origin)) {
            console.log(`CORS allowed — origin: ${origin || "(none)"}`);
            callback(null, true);
            return;
        }

        console.warn(`CORS rejected — origin: ${origin}`);
        console.warn(`CORS whitelist: ${allowedOrigins.join(", ")}`);
        // Use false (not Error) so the cors package responds without breaking headers
        callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
};

// Middleware — CORS must run before body parsers and routes (handles OPTIONS preflight)
console.log("Setting up CORS...");
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

console.log("Setting up body parsers...");
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(
        `${new Date().toISOString()} ${req.method} ${req.path} origin=${req.headers.origin || "(none)"}`
    );
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

app.post("/api/ai/generate-questions", protect, aiRateLimitMiddleware, aiController.generateInterviewQuestions);
app.post("/api/ai/generate-explanation", protect, aiRateLimitMiddleware, aiController.generateConceptExplanation);
app.post("/api/ai/generate-topic-questions", protect, aiRateLimitMiddleware, aiController.generateTopicQuestions);

if (isDev) {
    console.log("Setting up development-only debug routes...");
    app.use("/api/debug", debugRoutes);
}

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
