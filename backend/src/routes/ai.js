const express = require('express');
const router = express.Router();
const multer = require('multer');
const { scoreResume, handleInterviewChat, handleGenerateBio } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/score-resume', protect, upload.single('resume'), scoreResume);
router.post('/interview', protect, handleInterviewChat);
router.post('/generate-bio', protect, handleGenerateBio);

module.exports = router;
