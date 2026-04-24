const express = require('express');
const auth = require('../../middleware/auth');
const controller = require('./org.controller');

const router = express.Router();

router.get('/me', auth, controller.getCurrentOrganization);

module.exports = router;
