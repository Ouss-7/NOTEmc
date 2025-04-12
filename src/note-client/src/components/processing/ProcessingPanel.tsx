import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Alert,
  LinearProgress,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchTools } from '../../store/toolsSlice';
import { submitProcessingJob } from '../../store/processingSlice';
import { Tool } from '../../types';
import useProcessingStatus from '../../hooks/useProcessingStatus';

interface ProcessingPanelProps {
  noteId: string;
  onComplete?: () => void;
}

const ProcessingPanel: React.FC<ProcessingPanelProps> = ({ noteId, onComplete }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: tools, status: toolsStatus } = useSelector((state: RootState) => state.tools);
  const notes = useSelector((state: RootState) => state.notes.items);
  
  // Local state for selected tools
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [activeJobId, setActiveJobId] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  
  // Get real-time processing status using our custom hook
  const {
    job,
    loading: jobLoading,
    error: jobError,
    isCompleted,
    progress,
  } = useProcessingStatus({
    jobId: activeJobId,
    autoStart: !!activeJobId,
  });
  
  // Fetch tools when component mounts
  useEffect(() => {
    dispatch(fetchTools());
  }, [dispatch]);

  // Call onComplete callback when job is completed
  useEffect(() => {
    if (isCompleted && onComplete) {
      onComplete();
    }
  }, [isCompleted, onComplete]);
  
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
    if (selectedTools.length === 0) return;
    
    try {
      // Find the note content
      const note = notes.find(n => n.id === noteId);
      if (!note) {
        console.error('Note not found');
        return;
      }
      
      const resultAction = await dispatch(submitProcessingJob({
        noteId,
        toolIds: selectedTools,
        content: note.content
      }));
      
      if (submitProcessingJob.fulfilled.match(resultAction)) {
        // Set the active job ID to start polling for status
        setActiveJobId(resultAction.payload.id);
      }
    } catch (error) {
      console.error('Failed to submit processing job:', error);
    }
  };
  
  // Determine current processing step
  const getActiveStep = () => {
    if (!job) return 0;
    
    switch (job.status) {
      case 'queued': return 0;
      case 'processing': return 1;
      case 'completed': return 2;
      case 'failed': return -1; // Error state
      default: return 0;
    }
  };
  
  // View results
  const handleViewResults = () => {
    setShowResults(true);
  };
  
  // Reset processing
  const handleReset = () => {
    setActiveJobId('');
    setShowResults(false);
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Process Note
      </Typography>
      
      {!activeJobId ? (
        // Tool selection view
        <>
          <Typography variant="body2" color="text.secondary" paragraph>
            Select tools to process your note:
          </Typography>
          
          {toolsStatus === 'loading' ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <FormGroup>
              {tools.map((tool: Tool) => (
                <FormControlLabel
                  key={tool.id}
                  control={
                    <Checkbox
                      checked={selectedTools.includes(tool.id)}
                      onChange={handleToolChange(tool.id)}
                      disabled={tool.status !== 'active'}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">{tool.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tool.description}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </FormGroup>
          )}
          
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={selectedTools.length === 0 || toolsStatus === 'loading'}
            >
              Process Note
            </Button>
          </Box>
        </>
      ) : (
        // Processing status view
        <Box>
          <Stepper activeStep={getActiveStep()} sx={{ mb: 3 }}>
            <Step>
              <StepLabel>Queued</StepLabel>
            </Step>
            <Step>
              <StepLabel>Processing</StepLabel>
            </Step>
            <Step>
              <StepLabel>Completed</StepLabel>
            </Step>
          </Stepper>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Status: <strong>{job?.status || 'Unknown'}</strong>
            </Typography>
            
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ mt: 1, mb: 2 }} 
            />
            
            <Typography variant="caption" color="text.secondary">
              {progress}% Complete
            </Typography>
          </Box>
          
          {jobError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {jobError.message || 'An error occurred during processing'}
            </Alert>
          )}
          
          {isCompleted && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleViewResults}
              >
                View Results
              </Button>
            </Box>
          )}
          
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleReset}
              disabled={job?.status === 'processing'}
            >
              {isCompleted ? 'Process Again' : 'Cancel'}
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default ProcessingPanel;
