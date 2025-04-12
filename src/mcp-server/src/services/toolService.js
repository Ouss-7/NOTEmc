const { generateSummary, analyzeSentiment } = require('./aiTools/naturalService');

// Tool definitions
const tools = [
  {
    id: 'summary',
    name: 'Text Summarization',
    description: 'Automatically generate a concise summary of your note',
    type: 'summary',
    status: 'active',
    parameters: {
      sentenceCount: {
        type: 'number',
        required: false,
        default: 3,
        description: 'Number of sentences to include in the summary'
      }
    },
    processor: async (text, params = {}) => {
      const sentenceCount = params.sentenceCount || 3;
      return generateSummary(text, sentenceCount);
    }
  },
  {
    id: 'sentiment',
    name: 'Sentiment Analysis',
    description: 'Analyze the emotional tone of your note',
    type: 'sentiment',
    status: 'active',
    parameters: {},
    processor: async (text) => {
      return analyzeSentiment(text);
    }
  }
];

// Get all available tools
const getAllTools = () => {
  return tools.map(tool => {
    // Don't expose the processor function in the API
    const { processor, ...toolData } = tool;
    return toolData;
  });
};

// Get a tool by ID
const getToolById = (id) => {
  const tool = tools.find(t => t.id === id);
  if (!tool) return null;
  
  const { processor, ...toolData } = tool;
  return toolData;
};

// Process text with a specific tool
const processWithTool = async (toolId, text, parameters = {}) => {
  const tool = tools.find(t => t.id === toolId);
  
  if (!tool) {
    throw new Error(`Tool with ID ${toolId} not found`);
  }
  
  if (tool.status !== 'active') {
    throw new Error(`Tool ${tool.name} is not active`);
  }
  
  try {
    return await tool.processor(text, parameters);
  } catch (error) {
    throw new Error(`Error processing with ${tool.name}: ${error.message}`);
  }
};

module.exports = {
  getAllTools,
  getToolById,
  processWithTool
};