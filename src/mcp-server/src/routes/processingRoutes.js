const express = require('express');
const { submitJob, getJobById, getAllJobs } = require('../controllers/processingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected by default
router.use(protect);

/**
 * @swagger
 * /api/process:
 *   post:
 *     summary: Submit a new processing job
 *     tags: [Processing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - noteId
 *               - toolIds
 *               - content
 */
router.post('/', submitJob);

/**
 * @swagger
 * /api/process:
 *   get:
 *     summary: Get all processing jobs
 *     tags: [Processing]
 *     responses:
 *       200:
 *         description: List of all processing jobs
 */
router.get('/', getAllJobs);

/**
 * @swagger
 * /api/process/{id}:
 *   get:
 *     summary: Get status of a processing job
 *     tags: [Processing]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', getJobById);

module.exports = router;