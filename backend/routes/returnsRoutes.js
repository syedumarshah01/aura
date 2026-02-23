const express = require('express');
const router = express.Router();
const { sendReturnRequest, getReturnRequests, updateReturnStatus } = require('../controllers/returnsController');

router.route('/').post(sendReturnRequest).get(getReturnRequests);
router.patch('/:id/status', updateReturnStatus);

module.exports = router;
