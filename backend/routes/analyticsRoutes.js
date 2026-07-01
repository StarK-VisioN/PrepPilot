const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const documentUpload = require("../middlewares/documentUploadMiddleware");
const analyticsController = require("../controllers/analyticsController");
const resumeAnalyticsController = require("../controllers/resumeAnalyticsController");

const router = express.Router();

router.post(
    "/resume/upload",
    protect,
    documentUpload.single("file"),
    resumeAnalyticsController.uploadResume
);
router.get("/resume/latest", protect, resumeAnalyticsController.getLatestResume);
router.get("/resume/history", protect, resumeAnalyticsController.getResumeHistory);
router.delete("/resume/:id", protect, resumeAnalyticsController.deleteResume);

router.get("/dashboard", protect, analyticsController.getDashboard);
router.get("/topics", protect, analyticsController.getTopics);
router.get("/roadmap", protect, analyticsController.getRoadmap);
router.get("/recommendations", protect, analyticsController.getRecommendations);
router.get("/goals", protect, analyticsController.getGoals);
router.post("/goals", protect, analyticsController.saveGoals);
router.get("/history", protect, analyticsController.getHistory);

module.exports = router;
