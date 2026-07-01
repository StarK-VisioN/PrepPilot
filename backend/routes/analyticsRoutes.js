const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const analyticsController = require("../controllers/analyticsController");

const router = express.Router();

router.get("/dashboard", protect, analyticsController.getDashboard);
router.get("/topics", protect, analyticsController.getTopics);
router.get("/roadmap", protect, analyticsController.getRoadmap);
router.get("/recommendations", protect, analyticsController.getRecommendations);
router.get("/goals", protect, analyticsController.getGoals);
router.post("/goals", protect, analyticsController.saveGoals);
router.get("/history", protect, analyticsController.getHistory);

module.exports = router;
