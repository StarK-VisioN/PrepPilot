const express = require("express");

const { protect } = require("../middlewares/authMiddleware");

const codingController = require("../controllers/codingController");



const router = express.Router();



router.get("/languages", protect, codingController.getLanguages);

router.get("/runtimes", protect, codingController.getRuntimes);

router.get("/preferences", protect, codingController.getPreferences);

router.put("/preferences", protect, codingController.updatePreferences);

router.get("/challenges", protect, codingController.getChallenges);

router.get("/challenges/slug/:slug", protect, codingController.getChallengeBySlug);

router.get("/challenges/:id", protect, codingController.getChallengeById);



router.post("/run", protect, codingController.runCode);

router.post("/submit", protect, codingController.submitCode);



router.get("/submissions/:challengeId", protect, codingController.getSubmissions);

router.get("/draft/:challengeId", protect, codingController.getDraftCode);

router.put("/draft/:challengeId", protect, codingController.saveDraftCode);



module.exports = router;

