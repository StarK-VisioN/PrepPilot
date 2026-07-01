const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const behavioralController = require("../controllers/behavioralController");

const router = express.Router();

router.get("/questions", protect, behavioralController.getQuestions);
router.get("/questions/:id", protect, behavioralController.getQuestionById);
router.post("/submit", protect, behavioralController.submitAnswer);
router.get("/history", protect, behavioralController.getHistory);
router.get("/stats", protect, behavioralController.getStats);

module.exports = router;
