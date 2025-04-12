import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Note, ApiErrorResponse } from '../types';
import { notesApi } from '../services/api';
import { normalizeError } from '../utils/errorHandling';

interface NotesState {
  items: Note[];
  activeNote: Note | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: ApiErrorResponse | null;
}

const initialState: NotesState = {
  items: [],
  activeNote: null,
  status: 'idle',
  error: null,
};

export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notesApi.getAllNotes();
      return response.data;
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const fetchNote = createAsyncThunk(
  'notes/fetchNote',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await notesApi.getNoteById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const createNote = createAsyncThunk(
  'notes/createNote',
  async (note: Partial<Note>, { rejectWithValue }) => {
    try {
      const response = await notesApi.createNote(note);
      return response.data;
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ id, note }: { id: string; note: Partial<Note> }, { rejectWithValue }) => {
    try {
      const response = await notesApi.updateNote(id, note);
      return response.data;
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (id: string, { rejectWithValue }) => {
    try {
      await notesApi.deleteNote(id);
      return id;
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setActiveNote: (state, action) => {
      state.activeNote = action.payload;
    },
    clearNotesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notes
      .addCase(fetchNotes.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as ApiErrorResponse || {
          status: 500,
          message: action.error.message || 'Unknown error',
          data: {},
        };
      })
      
      // Fetch note
      .addCase(fetchNote.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
          state.activeNote = action.payload;
        }
      })
      .addCase(fetchNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as ApiErrorResponse || {
          status: 500,
          message: action.error.message || 'Unknown error',
          data: {},
        };
      })
      
      // Create note
      .addCase(createNote.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.push(action.payload);
      })
      .addCase(createNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as ApiErrorResponse || {
          status: 500,
          message: action.error.message || 'Unknown error',
          data: {},
        };
      })
      
      // Update note
      .addCase(updateNote.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.items.findIndex(note => note.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as ApiErrorResponse || {
          status: 500,
          message: action.error.message || 'Unknown error',
          data: {},
        };
      })
      
      // Delete note
      .addCase(deleteNote.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter(note => note.id !== action.payload);
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as ApiErrorResponse || {
          status: 500,
          message: action.error.message || 'Unknown error',
          data: {},
        };
      });
  },
});

export const { setActiveNote, clearNotesError } = notesSlice.actions;
export default notesSlice.reducer;
