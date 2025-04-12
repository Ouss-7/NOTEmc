import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchNote, createNote, updateNote } from '../../store/notesSlice';
import { Note } from '../../types';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// Predefined categories and tags for the demo
const CATEGORIES = ['Personal', 'Work', 'Study', 'Health', 'Finance', 'Other'];
const SUGGESTED_TAGS = ['Important', 'Urgent', 'Idea', 'Todo', 'Meeting', 'Project', 'Research', 'Follow-up'];

const NoteEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.notes);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  
  // Validation state
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  
  // UI state
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const isEditMode = !!id;
  
  // Load note data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchNote(id));
    }
  }, [dispatch, id, isEditMode]);
  
  // Get current note from state
  const currentNote = useSelector((state: RootState) => 
    state.notes.items.find((note: Note) => note.id === id)
  );

  // Populate form with note data when available
  useEffect(() => {
    if (isEditMode && currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      setCategory(currentNote.category || '');
      setTags(currentNote.tags || []);
    }
  }, [id, isEditMode, currentNote]);
  
  // Handle title change with validation
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    
    // Validate title
    if (!value.trim()) {
      setTitleError('Title is required');
    } else if (value.length > 100) {
      setTitleError('Title must be less than 100 characters');
    } else {
      setTitleError('');
    }
  };
  
  // Handle content change with validation
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setContent(value);
    
    // Validate content
    if (!value.trim()) {
      setContentError('Content is required');
    } else {
      setContentError('');
    }
  };
  
  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setCategory(e.target.value as string);
  };
  
  // Handle tags change
  const handleTagsChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setTags(e.target.value as string[]);
  };
  
  // Add custom tag
  const handleAddCustomTag = () => {
    if (customTag && !tags.includes(customTag)) {
      setTags([...tags, customTag]);
      setCustomTag('');
    }
  };
  
  // Handle custom tag input
  const handleCustomTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTag(e.target.value);
  };
  
  // Handle custom tag keypress (add on Enter)
  const handleCustomTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Validate title
    if (!title.trim()) {
      setTitleError('Title is required');
      isValid = false;
    } else if (title.length > 100) {
      setTitleError('Title must be less than 100 characters');
      isValid = false;
    } else {
      setTitleError('');
    }
    
    // Validate content
    if (!content.trim()) {
      setContentError('Content is required');
      isValid = false;
    } else {
      setContentError('');
    }
    
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const noteData: Partial<Note> = {
      title,
      content,
      category,
      tags,
    };
    
    try {
      if (isEditMode) {
        await dispatch(updateNote({ id, note: noteData })).unwrap();
        setSuccessMessage('Note updated successfully!');
      } else {
        await dispatch(createNote(noteData)).unwrap();
        setSuccessMessage('Note created successfully!');
      }
      
      setShowSuccess(true);
      
      // Navigate back to notes list after a short delay
      setTimeout(() => {
        navigate('/notes');
      }, 1500);
    } catch (error: any) {
      console.error('Failed to save note:', error);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/notes');
  };
  
  // Close success notification
  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };
  
  const isLoading = status === 'loading';
  const hasError = status === 'failed';
  
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isEditMode ? 'Edit Note' : 'Create New Note'}
        </Typography>
        
        {hasError && error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error.message || 'An error occurred. Please try again.'}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="title"
                label="Title"
                value={title}
                onChange={handleTitleChange}
                error={!!titleError}
                helperText={titleError}
                disabled={isLoading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="content"
                label="Content"
                multiline
                rows={6}
                value={content}
                onChange={handleContentChange}
                error={!!contentError}
                helperText={contentError}
                disabled={isLoading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  value={category}
                  onChange={handleCategoryChange as any}
                  label="Category"
                  disabled={isLoading}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="tags-label">Tags</InputLabel>
                <Select
                  labelId="tags-label"
                  id="tags"
                  multiple
                  value={tags}
                  onChange={handleTagsChange as any}
                  input={<OutlinedInput id="select-multiple-chip" label="Tags" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                  disabled={isLoading}
                >
                  {SUGGESTED_TAGS.map((tag) => (
                    <MenuItem
                      key={tag}
                      value={tag}
                      style={{
                        fontWeight: tags.indexOf(tag) === -1 ? 'normal' : 'bold',
                      }}
                    >
                      {tag}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  id="custom-tag"
                  label="Add Custom Tag"
                  value={customTag}
                  onChange={handleCustomTagChange}
                  onKeyPress={handleCustomTagKeyPress}
                  disabled={isLoading}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddCustomTag}
                  disabled={!customTag || isLoading}
                >
                  Add
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={24} />
                  ) : isEditMode ? (
                    'Update Note'
                  ) : (
                    'Create Note'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NoteEditor;
