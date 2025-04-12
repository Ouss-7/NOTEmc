import React from 'react';
import { Paper, Typography, Box, Divider } from '@mui/material';
import { SentimentSatisfied, SentimentVeryDissatisfied, SentimentNeutral } from '@mui/icons-material';

interface NoteAnalysisProps {
  results: {
    summary?: string;
    sentiment?: {
      score: number;
      category: string;
    };
  };
}

const NoteAnalysis: React.FC<NoteAnalysisProps> = ({ results }) => {
  if (!results || ((!results.summary) && (!results.sentiment))) {
    return null;
  }
  
  const renderSentimentIcon = (category: string) => {
    switch (category) {
      case 'positive':
        return <SentimentSatisfied color="success" />;
      case 'negative':
        return <SentimentVeryDissatisfied color="error" />;
      default:
        return <SentimentNeutral color="action" />;
    }
  };
  
  return (
    <Paper sx={{ p: 2, mt: 3, bgcolor: '#f8f9fa' }}>
      <Typography variant="h6" gutterBottom>
        Analysis Results
      </Typography>
      
      {results.summary && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Summary
          </Typography>
          <Typography variant="body2">
            {results.summary}
          </Typography>
        </Box>
      )}
      
      {results.summary && results.sentiment && <Divider sx={{ my: 2 }} />}
      
      {results.sentiment && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ mr: 1 }}>
            {renderSentimentIcon(results.sentiment.category)}
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              Sentiment: {results.sentiment.category.charAt(0).toUpperCase() + results.sentiment.category.slice(1)}
            </Typography>
            <Typography variant="body2">
              Score: {results.sentiment.score.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default NoteAnalysis;
