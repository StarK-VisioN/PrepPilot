const express = require('express');
const {createSession, getSessionById, getMySessions, deleteSession, updateCustomSkills, deleteTopicQuestions} = require('../controllers/sessionController');
const {protect} = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/create', protect, createSession);
router.get('/my-sessions', protect, getMySessions);
router.patch('/:id/custom-skills', protect, updateCustomSkills);
router.delete('/:id/topic-questions/:topic', protect, deleteTopicQuestions);
router.get('/:id', protect, getSessionById);
router.delete('/:id', protect, deleteSession);

module.exports = router;
