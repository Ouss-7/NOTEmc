import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Spellcheck as GrammarIcon,
  Psychology as SentimentIcon,
  Summarize as SummaryIcon,
} from '@mui/icons-material';
import { Note } from '../../types';

interface AnalysisResultsProps {
  note: Note;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ note }) => {
  if (!note.analysis) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>No analysis available for this note.</Typography>
      </Paper>
    );
  }

  const renderGrammarAnalysis = () => {
    if (!note.analysis?.grammar) return null;

    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GrammarIcon color="primary" />
            <Typography>Grammar Analysis</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {note.analysis.grammar.corrections?.map((correction: any, index: number) => (
              <Paper key={index} sx={{ p: 2, mb: 1, bgcolor: 'background.default' }}>
                <Typography color="error" gutterBottom>
                  {correction.original}
                </Typography>
                <Typography color="success.main">
                  {correction.suggestion}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {correction.explanation}
                </Typography>
              </Paper>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderSentimentAnalysis = () => {
    if (!note.analysis?.sentiment) return null;

    const { score, sentiment } = note.analysis.sentiment;
    const normalizedScore = (score + 1) * 50; // Convert -1 to 1 range to 0 to 100

    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SentimentIcon color="primary" />
            <Typography>Sentiment Analysis</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Sentiment Score</Typography>
              <Chip
                label={sentiment}
                color={
                  sentiment === 'positive' ? 'success' :
                  sentiment === 'negative' ? 'error' : 'default'
                }
                size="small"
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={normalizedScore}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  bgcolor: sentiment === 'positive' ? 'success.main' :
                          sentiment === 'negative' ? 'error.main' : 'grey.500',
                },
              }}
            />
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderSummaryAnalysis = () => {
    if (!note.analysis?.summary) return null;

    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SummaryIcon color="primary" />
            <Typography>Summary</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            {note.analysis.summary.content}
          </Typography>
          {note.analysis.summary.keywords && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Key Topics:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {note.analysis.summary.keywords.map((keyword: string, index: number) => (
                  <Chip key={index} label={keyword} size="small" />
                ))}
              </Box>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Analysis Results
      </Typography>
      {renderGrammarAnalysis()}
      {renderSentimentAnalysis()}
      {renderSummaryAnalysis()}
    </Box>
  );
};

export default AnalysisResults;
