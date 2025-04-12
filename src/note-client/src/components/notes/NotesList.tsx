import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchNotes, deleteNote } from '../../store/notesSlice';
import { Note } from '../../types';
import useApi from '../../hooks/useApi';

const NotesList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items: reduxNotes, status } = useSelector((state: RootState) => state.notes);
  
  // Using our custom hook for direct API calls as an alternative to Redux
  const { loading, error, execute } = useApi<Note[]>();
  
  // State for error notification
  const [errorNotification, setErrorNotification] = React.useState<string | null>(null);
  
  // State for search, filter, and sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('updatedAt_desc');
  const [filterOption, setFilterOption] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Fetch notes when component mounts
  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);
  
  // Handle note deletion
  const handleDelete = async (noteId: string) => {
    try {
      await dispatch(deleteNote(noteId)).unwrap();
    } catch (error: any) {
      setErrorNotification(error.message || 'Failed to delete note');
    }
  };
  
  // Handle navigation to edit page
  const handleEdit = (noteId: string) => {
    navigate(`/notes/${noteId}/edit`);
  };
  
  // Handle navigation to processing page
  const handleProcess = (noteId: string) => {
    navigate(`/notes/${noteId}/process`);
  };
  
  // Handle navigation to analysis page
  const handleAnalysis = (noteId: string) => {
    navigate(`/notes/${noteId}/analysis`);
  };
  
  // Handle navigation to create new note
  const handleCreateNew = () => {
    navigate('/notes/new');
  };
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle sort option change
  const handleSortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSortOption(event.target.value as string);
  };
  
  // Handle filter option change
  const handleFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFilterOption(event.target.value as string);
  };
  
  // Handle tag filter change
  const handleTagFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setTagFilter(event.target.value as string);
  };
  
  // Toggle advanced filters visibility
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };
  
  // Clear all filters and search
  const clearFilters = () => {
    setSearchQuery('');
    setFilterOption('all');
    setTagFilter('all');
    setSortOption('updatedAt_desc');
  };
  
  // Close error notification
  const handleCloseError = () => {
    setErrorNotification(null);
  };
  
  // Filter and sort notes
  const getFilteredAndSortedNotes = () => {
    // First filter notes
    let filteredNotes = [...reduxNotes];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredNotes = filteredNotes.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Apply category filter
    if (filterOption !== 'all') {
      filteredNotes = filteredNotes.filter(note => note.category === filterOption);
    }
    
    // Apply tag filter
    if (tagFilter !== 'all') {
      filteredNotes = filteredNotes.filter(note => 
        note.tags && note.tags.includes(tagFilter)
      );
    }
    
    // Sort notes
    const [sortField, sortDirection] = sortOption.split('_');
    
    // Create a new array to avoid mutating the original
    return [...filteredNotes].sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === 'updatedAt') {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };
  
  // Get unique categories for filter dropdown
  const getUniqueCategories = () => {
    const categories = reduxNotes.map(note => note.category).filter(Boolean) as string[];
    return ['all', ...Array.from(new Set(categories))];
  };
  
  // Get unique tags for tag filter dropdown
  const getUniqueTags = () => {
    const allTags = reduxNotes.flatMap(note => note.tags || []);
    return ['all', ...Array.from(new Set(allTags))];
  };
  
  const filteredAndSortedNotes = getFilteredAndSortedNotes();
  const uniqueCategories = getUniqueCategories();
  const uniqueTags = getUniqueTags();
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Notes</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          Create New
        </Button>
      </Box>
      
      <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search notes..."
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1, minWidth: '200px' }}
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    edge="end"
                    title="Clear search"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
          
          <Button
            variant="outlined"
            color="primary"
            onClick={toggleAdvancedFilters}
            startIcon={<FilterIcon />}
            size="small"
          >
            {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </Box>
        
        {showAdvancedFilters && (
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Advanced Filters</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
              <FormControl variant="outlined" size="small" sx={{ minWidth: '150px' }}>
                <InputLabel id="filter-label">Category</InputLabel>
                <Select
                  labelId="filter-label"
                  value={filterOption}
                  onChange={handleFilterChange as any}
                  label="Category"
                >
                  {uniqueCategories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl variant="outlined" size="small" sx={{ minWidth: '150px' }}>
                <InputLabel id="tag-filter-label">Tag</InputLabel>
                <Select
                  labelId="tag-filter-label"
                  value={tagFilter}
                  onChange={handleTagFilterChange as any}
                  label="Tag"
                >
                  {uniqueTags.map(tag => (
                    <MenuItem key={tag} value={tag}>
                      {tag === 'all' ? 'All Tags' : tag}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl variant="outlined" size="small" sx={{ minWidth: '150px' }}>
                <InputLabel id="sort-label">Sort By</InputLabel>
                <Select
                  labelId="sort-label"
                  value={sortOption}
                  onChange={handleSortChange as any}
                  label="Sort By"
                >
                  <MenuItem value="title_asc">Title (A-Z)</MenuItem>
                  <MenuItem value="title_desc">Title (Z-A)</MenuItem>
                  <MenuItem value="createdAt_desc">Newest First</MenuItem>
                  <MenuItem value="createdAt_asc">Oldest First</MenuItem>
                  <MenuItem value="updatedAt_desc">Recently Updated</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                variant="outlined"
                size="small"
                onClick={clearFilters}
                startIcon={<DeleteIcon />}
              >
                Clear Filters
              </Button>
            </Box>
          </Box>
        )}
      </Box>
      
      {status === 'loading' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {status === 'failed' && error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'Failed to load notes'}
        </Alert>
      )}
      
      {status === 'succeeded' && filteredAndSortedNotes.length === 0 && (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6" color="text.secondary">
            {searchQuery || filterOption !== 'all' 
              ? 'No notes match your search criteria' 
              : 'You have no notes yet'}
          </Typography>
          {!searchQuery && filterOption === 'all' && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleCreateNew}
              sx={{ mt: 2 }}
            >
              Create Your First Note
            </Button>
          )}
        </Box>
      )}
      
      <Grid container spacing={3}>
        {filteredAndSortedNotes.map((note) => (
          <Grid item xs={12} sm={6} md={4} key={note.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {note.title}
                </Typography>
                
                {note.category && (
                  <Chip 
                    label={note.category} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                )}
                
                <Typography variant="body2" color="text.secondary" sx={{ 
                  mb: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {note.content}
                </Typography>
                
                {note.tags && note.tags.length > 0 && (
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {note.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                )}
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Last updated: {new Date(note.updatedAt).toLocaleDateString()}
                </Typography>
              </CardContent>
              
              <Divider />
              
              <CardActions sx={{ justifyContent: 'space-between', p: 1 }}>
                <Box>
                  <IconButton size="small" onClick={() => handleEdit(note.id)} title="Edit">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleProcess(note.id)} title="Process">
                    <BuildIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleAnalysis(note.id)} title="Analysis">
                    <AssessmentIcon fontSize="small" />
                  </IconButton>
                </Box>
                <IconButton size="small" onClick={() => handleDelete(note.id)} title="Delete">
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Snackbar 
        open={!!errorNotification} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error">
          {errorNotification}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotesList;
