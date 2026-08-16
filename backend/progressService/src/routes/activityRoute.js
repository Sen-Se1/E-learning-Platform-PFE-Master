const express = require('express');
const { logActivity, getActivities } = require('../controllers/activityController');

const router = express.Router();

router.post('/log', logActivity);
router.get('/', getActivities);

module.exports = router;
