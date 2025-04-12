import React, { useState } from 'react';
import { Button, Chip, CircularProgress, Typography, Box } from '@mui/material';
import { useDispatch } from 'react-redux';
import { processingApi } from '../services/api';
import { startProcessing, completeProcessing } from '../store/processingSlice';

interface NoteToolsProps {
  noteId: string;
  content: string;
  onProcessingComplete: (results: any) => void;
}

const NoteTools: React.FC<NoteToolsProps> = ({ noteId, content, onProcessingComplete }) => {
  const dispatch = useDispatch();
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const toggleTool = (toolId: string) => {
    if (selectedTools.includes(toolId)) {
      setSelectedTools(selectedTools.filter(id => id !== toolId));
    } else {
      setSelectedTools([...selectedTools, toolId]);
    }
  };

  const handleProcess = async () => {
    if (selectedTools.length === 0) return;
    
    setIsProcessing(true);
    dispatch(startProcessing(noteId));
    
    try {
      const response = await processingApi.submitJob(noteId, selectedTools, content);
      const jobId = response.data.id;
      
      // Poll for job completion
      const checkInterval = setInterval(async () => {
        const statusResponse = await processingApi.getJobStatus(jobId);
        const job = statusResponse.data;
        
        if (job.status === 'completed' || job.status === 'failed') {
          clearInterval(checkInterval);
          setIsProcessing(false);
          
          if (job.status === 'completed') {
            dispatch(completeProcessing({ noteId, results: job.results }));
            onProcessingComplete(job.results);
          }
        }
      }, 1000);
    } catch (error) {
      setIsProcessing(false);
      console.error('Processing error:', error);
    }
  };
  
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        AI Tools
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Chip
          label="Summarize"
          clickable
          color={selectedTools.includes('summary') ? 'primary' : 'default'}
          onClick={() => toggleTool('summary')}
        />
        <Chip
          label="Sentiment Analysis"
          clickable
          color={selectedTools.includes('sentiment') ? 'primary' : 'default'}
          onClick={() => toggleTool('sentiment')}
        />
      </Box>
      
      <Button
        variant="contained"
        disabled={selectedTools.length === 0 || isProcessing}
        onClick={handleProcess}
        startIcon={isProcessing ? <CircularProgress size={20} /> : null}
      >
        {isProcessing ? 'Processing...' : 'Process Note'}
      </Button>
    </Box>
  );
};

export default NoteTools;
