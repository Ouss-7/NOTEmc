import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toolsApi } from '../services/api';
import { Tool } from '../types';
import axios from 'axios';

// Define the initial state
interface ToolsState {
  items: Tool[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedTools: string[];
}

const initialState: ToolsState = {
  items: [],
  status: 'idle',
  error: null,
  selectedTools: [],
};

// Async thunk for fetching tools
export const fetchTools = createAsyncThunk(
  'tools/fetchTools',
  async (_, { rejectWithValue }) => {
    try {
      // Direct API call to ensure no mock data
      console.log('Fetching tools directly from backend');
      const response = await axios.get('http://localhost:3001/api/tools');
      console.log('Tools response:', response.data);
      
      // Extract tools from response
      const tools = response.data.data || response.data;
      return tools;
    } catch (error: any) {
      console.error('Error fetching tools:', error);
      return rejectWithValue(error.message || 'Failed to fetch tools');
    }
  }
);

// Create the tools slice
const toolsSlice = createSlice({
  name: 'tools',
  initialState,
  reducers: {
    selectTool: (state, action) => {
      const toolId = action.payload;
      if (!state.selectedTools.includes(toolId)) {
        state.selectedTools.push(toolId);
      }
    },
    deselectTool: (state, action) => {
      const toolId = action.payload;
      state.selectedTools = state.selectedTools.filter(id => id !== toolId);
    },
    clearSelectedTools: (state) => {
      state.selectedTools = [];
    },
    clearToolsError: (state) => {
      state.error = null;
    },
    resetTools: (state) => {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTools.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTools.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTools.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  }
});

// Export actions and reducer
export const { selectTool, deselectTool, clearSelectedTools, clearToolsError, resetTools } = toolsSlice.actions;
export default toolsSlice.reducer;
