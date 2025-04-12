const express = require('express');
const { getAllTools, getToolById, createTool, updateTool, deleteTool } = require('../controllers/toolController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected by default
router.use(protect);

/**
 * @swagger
 * /api/tools:
 *   get:
 *     summary: Get all tools
 *     tags: [Tools]
 *     responses:
 *       200:
 *         description: List of all tools
 */
router.get('/', getAllTools);

/**
 * @swagger
 * /api/tools/{id}:
 *   get:
 *     summary: Get a tool by ID
 *     tags: [Tools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', getToolById);

/**
 * @swagger
 * /api/tools:
 *   post:
 *     summary: Create a new tool
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tool'
 */
router.post('/', createTool);

/**
 * @swagger
 * /api/tools/{id}:
 *   put:
 *     summary: Update a tool
 *     tags: [Tools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id', updateTool);

/**
 * @swagger
 * /api/tools/{id}:
 *   delete:
 *     summary: Delete a tool
 *     tags: [Tools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', deleteTool);

module.exports = router;
