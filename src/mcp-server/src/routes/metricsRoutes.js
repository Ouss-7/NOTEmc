const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Get service metrics
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Service metrics
 */
router.get('/', metricsController.getMetrics);

/**
 * @swagger
 * /api/metrics/processing:
 *   get:
 *     summary: Get processing metrics
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Processing metrics
 */
router.get('/processing', metricsController.getProcessingMetrics);

/**
 * @swagger
 * /api/metrics/tools:
 *   get:
 *     summary: Get tool usage metrics
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Tool usage metrics
 */
router.get('/tools', metricsController.getToolMetrics);

module.exports = router;
