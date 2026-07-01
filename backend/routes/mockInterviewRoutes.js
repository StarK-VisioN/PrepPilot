const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const aiRateLimitMiddleware = require("../middlewares/aiRateLimitMiddleware");
const mockInterviewController = require("../controllers/mockInterviewController");

const router = express.Router();

router.get("/config", protect, mockInterviewController.getConfig);
router.get("/history", protect, mockInterviewController.getHistory);
router.get("/session/:id", protect, mockInterviewController.getSession);
router.get("/report/:id", protect, mockInterviewController.getReport);

router.post("/start", protect, aiRateLimitMiddleware, mockInterviewController.startInterview);
router.post("/message", protect, aiRateLimitMiddleware, mockInterviewController.sendMessage);
router.post("/end", protect, aiRateLimitMiddleware, mockInterviewController.endInterview);

module.exports = router;
