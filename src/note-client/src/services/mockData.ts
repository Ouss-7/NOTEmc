import { Note, Tool, ProcessingJob } from '../types';

// Mock Notes
export const mockNotes: Note[] = [
  {
    id: 'note1',
    title: 'Meeting Notes',
    content: 'Need to follow up with the team about the project timeline. Discuss budget concerns.',
    tags: ['meeting', 'project', 'follow-up'],
    category: 'Work',
    createdAt: '2023-05-15T10:30:00Z',
    updatedAt: '2023-05-15T11:45:00Z',
    status: 'processed',
    analysis: {
      grammar: {
        errors: 0,
        suggestions: []
      },
      sentiment: {
        score: 0.2,
        label: 'neutral'
      },
      summary: 'Follow up with team about project timeline and budget concerns.'
    }
  },
  {
    id: 'note2',
    title: 'Ideas for New Feature',
    content: 'We should implement a dark mode option for the app. Users have been requesting this feature frequently.',
    tags: ['feature', 'ui', 'user-request'],
    category: 'Development',
    createdAt: '2023-05-16T09:15:00Z',
    updatedAt: '2023-05-16T09:15:00Z',
    status: 'draft'
  },
  {
    id: 'note3',
    title: 'Weekly Review',
    content: 'Completed the API integration. Fixed 3 critical bugs. Started working on the new reporting feature.',
    tags: ['review', 'progress'],
    category: 'Progress',
    createdAt: '2023-05-17T16:00:00Z',
    updatedAt: '2023-05-17T16:30:00Z',
    status: 'processing'
  }
];

// Mock Tools
export const mockTools: Tool[] = [
  {
    id: 'tool1',
    name: 'Grammar Check',
    description: 'Analyzes text for grammatical errors and suggests corrections.',
    type: 'grammar',
    status: 'active',
    parameters: {
      language: {
        type: 'string',
        required: false,
        default: 'en'
      },
      strictness: {
        type: 'string',
        required: false,
        default: 'medium'
      }
    }
  },
  {
    id: 'tool2',
    name: 'Sentiment Analysis',
    description: 'Analyzes the sentiment of the text and provides a score.',
    type: 'sentiment',
    status: 'active',
    parameters: {
      model: {
        type: 'string',
        required: false,
        default: 'default'
      }
    }
  },
  {
    id: 'tool3',
    name: 'Text Summarizer',
    description: 'Creates a concise summary of the text content.',
    type: 'summary',
    status: 'active',
    parameters: {
      length: {
        type: 'string',
        required: false,
        default: 'medium'
      },
      format: {
        type: 'string',
        required: false,
        default: 'paragraph'
      }
    }
  }
];

// Mock Processing Jobs
export const mockProcessingJobs: ProcessingJob[] = [
  {
    id: 'job1',
    noteId: 'note1',
    toolIds: ['tool1', 'tool2', 'tool3'],
    status: 'completed',
    progress: 100,
    results: {
      grammar: {
        errors: 0,
        suggestions: []
      },
      sentiment: {
        score: 0.2,
        label: 'neutral'
      },
      summary: 'Follow up with team about project timeline and budget concerns.'
    },
    createdAt: '2023-05-15T10:45:00Z',
    updatedAt: '2023-05-15T10:50:00Z'
  },
  {
    id: 'job2',
    noteId: 'note3',
    toolIds: ['tool2', 'tool3'],
    status: 'processing',
    progress: 60,
    results: {
      grammar: {
        errors: 0,
        suggestions: []
      },
      sentiment: {
        score: 0.2,
        label: 'neutral'
      },
      summary: 'Follow up with team about project timeline and budget concerns.'
    },
    createdAt: '2023-05-17T16:35:00Z',
    updatedAt: '2023-05-17T16:40:00Z'
  }
];
