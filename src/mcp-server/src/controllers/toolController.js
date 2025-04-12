const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');
const Tool = require('../models/Tool');

// Default tools to seed the database if none exist
const defaultTools = [
  {
    id: 'text-summarizer',
    name: 'Text Summarizer',
    description: 'Creates a concise summary of the text content.',
    category: 'text-processing',
    status: 'active',
    config: {
      maxLength: 200
    }
  },
  {
    id: 'sentiment-analysis',
    name: 'Sentiment Analysis',
    description: 'Analyzes the sentiment of the text and provides a score.',
    category: 'analysis',
    status: 'active',
    config: {
      detailed: true
    }
  },
  {
    id: 'grammar-check',
    name: 'Grammar Check',
    description: 'Analyzes text for grammatical errors and suggests corrections.',
    category: 'text-processing',
    status: 'active',
    config: {
      checkSpelling: true,
      checkGrammar: true
    }
  }
];

// Seed default tools if none exist
const seedDefaultTools = async () => {
  try {
    const count = await Tool.countDocuments();
    if (count === 0) {
      logger.info('No tools found in database. Seeding default tools...');
      
      // Convert default tools to match the Tool schema
      const toolsToSeed = defaultTools.map(tool => ({
        name: tool.name,
        description: tool.description,
        type: tool.category === 'analysis' ? 'sentiment' : 'grammar',
        endpoint: `/api/process/${tool.id}`,
        apiKey: 'default-api-key',
        parameters: tool.config || {},
        status: tool.status,
        rateLimit: {
          requests: 100,
          period: 60
        },
        cacheConfig: {
          enabled: true,
          ttl: 3600
        }
      }));
      
      await Tool.insertMany(toolsToSeed);
      logger.info(`Seeded ${toolsToSeed.length} default tools`);
    }
  } catch (error) {
    logger.error(`Error seeding default tools: ${error.message}`);
  }
};

// Call the seed function when the controller is loaded
seedDefaultTools();

// Get all tools
const getAllTools = asyncHandler(async (req, res) => {
  try {
    const tools = await Tool.find({ status: 'active' });
    
    res.status(200).json({
      success: true,
      count: tools.length,
      data: tools
    });
  } catch (error) {
    logger.error(`Error getting tools: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

// Get tool by ID
const getToolById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const tool = await Tool.findById(id);

    if (!tool) {
      res.status(404);
      throw new Error('Tool not found');
    }

    res.status(200).json({
      success: true,
      data: tool
    });
  } catch (error) {
    logger.error(`Error getting tool: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

// Process text with a specific tool
const processTool = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { text, parameters } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text content is required'
      });
    }
    
    const tool = await Tool.findById(id);
    
    if (!tool) {
      return res.status(404).json({
        success: false,
        error: `Tool with ID ${id} not found`
      });
    }
    
    // Check if tool is active
    if (tool.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: `Tool ${tool.name} is currently ${tool.status}`
      });
    }
    
    // Simulate processing with the tool
    logger.info(`Processing text with tool: ${tool.name}`);
    const result = `Processed text with ${tool.name}: ${text.substring(0, 50)}...`;
    
    res.status(200).json({
      success: true,
      data: {
        result,
        toolName: tool.name,
        toolType: tool.type,
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error(`Error processing tool: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

// Create a new tool
const createTool = asyncHandler(async (req, res) => {
  try {
    const { name, description, type, endpoint, apiKey, parameters, rateLimit, cacheConfig } = req.body;
    
    // Validate required fields
    if (!name || !description || !type || !endpoint || !apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields: name, description, type, endpoint, apiKey'
      });
    }
    
    // Check if tool with same name already exists
    const existingTool = await Tool.findOne({ name });
    if (existingTool) {
      return res.status(400).json({
        success: false,
        error: `Tool with name '${name}' already exists`
      });
    }
    
    // Create new tool
    const tool = await Tool.create({
      name,
      description,
      type,
      endpoint,
      apiKey,
      parameters: parameters || {},
      rateLimit: rateLimit || { requests: 100, period: 60 },
      cacheConfig: cacheConfig || { enabled: true, ttl: 3600 }
    });
    
    logger.info(`Created new tool: ${name}`);
    res.status(201).json({
      success: true,
      data: tool
    });
  } catch (error) {
    logger.error(`Error creating tool: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

// Update an existing tool
const updateTool = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Find tool by ID
    const tool = await Tool.findById(id);
    if (!tool) {
      return res.status(404).json({
        success: false,
        error: 'Tool not found'
      });
    }
    
    // Update tool
    const updatedTool = await Tool.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    logger.info(`Updated tool: ${tool.name}`);
    res.status(200).json({
      success: true,
      data: updatedTool
    });
  } catch (error) {
    logger.error(`Error updating tool: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

// Delete a tool
const deleteTool = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find tool by ID
    const tool = await Tool.findById(id);
    if (!tool) {
      return res.status(404).json({
        success: false,
        error: 'Tool not found'
      });
    }
    
    // Delete tool
    await Tool.findByIdAndDelete(id);
    
    logger.info(`Deleted tool: ${tool.name}`);
    res.status(200).json({
      success: true,
      message: `Tool '${tool.name}' deleted successfully`
    });
  } catch (error) {
    logger.error(`Error deleting tool: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  getAllTools,
  getToolById,
  processTool,
  createTool,
  updateTool,
  deleteTool
};