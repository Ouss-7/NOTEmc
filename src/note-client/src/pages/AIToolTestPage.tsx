import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchTools } from '../store/toolsSlice';
import { processingApi } from '../services/api';
import { Tool, ProcessingJob } from '../types';
import axios from 'axios';

const AIToolTestPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: tools, status: toolsStatus } = useSelector((state: RootState) => state.tools);
  
  // Local state
  const [noteContent, setNoteContent] = useState<string>('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<ProcessingJob | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [results, setResults] = useState<any | null>(null);

  // Fetch tools when component mounts
  useEffect(() => {
    // Directly fetch tools from the backend
    const fetchToolsDirectly = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/tools');
        console.log('Tools fetched directly:', response.data);
      } catch (error) {
        console.error('Error fetching tools directly:', error);
      }
    };
    
    fetchToolsDirectly();
    dispatch(fetchTools());
  }, [dispatch]);

  // Cleanup polling interval when component unmounts
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  // Start polling for job status when jobId changes
  useEffect(() => {
    if (jobId) {
      // Start polling
      const interval = setInterval(async () => {
        try {
          // Direct API call to ensure no caching or mock data
          const response = await axios.get(`http://localhost:3001/api/process/${jobId}`);
          const updatedJob = response.data;
          console.log('Job status update:', updatedJob);
          
          setJob(updatedJob);
          
          // Update progress
          if (updatedJob.progress !== undefined) {
            setProgress(updatedJob.progress);
          }
          
          // Check if job is completed or failed
          if (updatedJob.status === 'completed') {
            clearInterval(interval);
            setProcessing(false);
            setResults(updatedJob.results);
          } else if (updatedJob.status === 'failed') {
            clearInterval(interval);
            setProcessing(false);
            setError(updatedJob.error || 'Processing failed');
          }
        } catch (error: any) {
          console.error('Error polling job status:', error);
          setError(error.message || 'Failed to get job status');
          clearInterval(interval);
          setProcessing(false);
        }
      }, 2000); // Poll every 2 seconds
      
      setPollInterval(interval);
      
      // Cleanup function
      return () => {
        clearInterval(interval);
      };
    }
  }, [jobId]);

  // Handle tool selection
  const handleToolChange = (toolId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedTools([...selectedTools, toolId]);
    } else {
      setSelectedTools(selectedTools.filter(id => id !== toolId));
    }
  };

  // Submit processing job
  const handleSubmit = async () => {
    if (selectedTools.length === 0) {
      setError('Please select at least one tool');
      return;
    }
    
    if (!noteContent.trim()) {
      setError('Please enter some content to process');
      return;
    }
    
    setError(null);
    setProcessing(true);
    setResults(null);
    
    try {
      // Create a temporary noteId for testing
      const noteId = `test-note-${Date.now()}`;
      
      // Direct API call to ensure no mock data
      console.log('Submitting job with data:', { noteId, toolIds: selectedTools, content: noteContent });
      const response = await axios.post('http://localhost:3001/api/process', {
        noteId,
        toolIds: selectedTools,
        content: noteContent
      });
      
      const newJob = response.data;
      console.log('Job submitted successfully:', newJob);
      
      setJob(newJob);
      setJobId(newJob.id);
    } catch (error: any) {
      console.error('Failed to submit processing job:', error);
      setError(error.message || 'Failed to submit processing job');
      setProcessing(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setNoteContent('');
    setSelectedTools([]);
    setProcessing(false);
    setError(null);
    setJob(null);
    setJobId(null);
    setProgress(0);
    setResults(null);
    
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
  };

  // Render result based on tool type
  const renderResult = (toolId: string, result: any) => {
    const tool = tools.find(t => t.id === toolId);
    
    if (!tool) {
      return (
        <Typography variant="body2">
          Result for unknown tool: {JSON.stringify(result)}
        </Typography>
      );
    }
    
    if (toolId === 'text-summarizer' || toolId === 'summary') {
      return (
        <Typography variant="body1">
          {result}
        </Typography>
      );
    } else if (toolId === 'sentiment-analysis' || toolId === 'sentiment') {
      return (
        <Box>
          <Typography variant="body2" gutterBottom>
            <strong>Score:</strong> {result.score}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Category:</strong> {result.category}
          </Typography>
          {result.analysis && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Analysis:</strong>
              </Typography>
              <Typography variant="body2">
                Positive: {result.analysis.positive ? 'Yes' : 'No'}<br />
                Negative: {result.analysis.negative ? 'Yes' : 'No'}<br />
                Strength: {result.analysis.strength}
              </Typography>
            </Box>
          )}
        </Box>
      );
    } else if (toolId === 'grammar-check' || toolId === 'grammar') {
      return (
        <Box>
          <Typography variant="body2" gutterBottom>
            <strong>Errors Found:</strong> {result.errors?.length || 0}
          </Typography>
          {result.errors && result.errors.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {result.errors.map((error: any, index: number) => (
                <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                  {error.message}
                  {error.suggestion && (
                    <Typography variant="caption" display="block">
                      Suggestion: {error.suggestion}
                    </Typography>
                  )}
                </Alert>
              ))}
            </Box>
          )}
        </Box>
      );
    } else {
      return (
        <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(result, null, 2)}
        </Typography>
      );
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: 'background.default',
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: 'white', opacity: 0.9 }}>
        AI Tool Test
      </Typography>
      
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            transform: 'translateY(-2px)',
          }
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ color: 'white', opacity: 0.9 }}>
          Test AI Processing Tools
        </Typography>
        
        <Divider sx={{ my: 2, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
        
        {error && (
          <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(211, 47, 47, 0.15)', color: 'white' }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ color: 'white', opacity: 0.9 }}>
            1. Enter Text to Process
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            placeholder="Enter some text to process..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            disabled={processing}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
              },
              '& .MuiInputBase-input': {
                color: 'white',
              },
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
              }
            }}
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ color: 'white', opacity: 0.9 }}>
            2. Select Processing Tools
          </Typography>
          
          {toolsStatus === 'loading' ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <FormGroup sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2 
            }}>
              {tools.map((tool: Tool) => (
                <FormControlLabel
                  key={tool.id}
                  control={
                    <Checkbox
                      checked={selectedTools.includes(tool.id)}
                      onChange={handleToolChange(tool.id)}
                      disabled={tool.status !== 'active' || processing}
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ color: 'white', opacity: 0.9 }}>
                        {tool.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {tool.description}
                      </Typography>
                    </Box>
                  }
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    p: 1,
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                />
              ))}
            </FormGroup>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={processing || selectedTools.length === 0 || !noteContent.trim()}
            sx={{
              borderRadius: '8px',
              py: 1.2,
              px: 3,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
              }
            }}
          >
            {processing ? 'Processing...' : 'Process Text'}
          </Button>
          
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleReset}
            disabled={processing}
            sx={{
              borderRadius: '8px',
              py: 1.2,
              px: 3,
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.4)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            Reset
          </Button>
        </Box>
        
        {processing && (
          <Box sx={{ 
            mb: 3, 
            p: 2, 
            bgcolor: 'rgba(255, 255, 255, 0.05)', 
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <Typography variant="subtitle1" gutterBottom sx={{ color: 'white', opacity: 0.9 }}>
              Processing Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ mr: 1, color: 'white', opacity: 0.8 }}>
                Status: 
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white' }}>
                {job?.status || 'Submitting...'}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                mb: 1,
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                }
              }} 
            />
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {progress}% Complete
            </Typography>
          </Box>
        )}
        
        {results && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', opacity: 0.9 }}>
              Processing Results
            </Typography>
            <Grid container spacing={3}>
              {Object.entries(results).map(([toolId, result]) => (
                <Grid item xs={12} md={6} key={toolId}>
                  <Card sx={{ 
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                      background: 'rgba(255, 255, 255, 0.08)',
                    }
                  }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ color: 'white', opacity: 0.9 }}>
                        {tools.find(t => t.id === toolId)?.name || toolId}
                      </Typography>
                      <Box sx={{ color: 'white', opacity: 0.8 }}>
                        {renderResult(toolId, result)}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AIToolTestPage;
