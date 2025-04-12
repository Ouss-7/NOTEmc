import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CardMedia, CardActionArea } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Tool } from '../types';

const ToolsPage: React.FC = () => {
  const { items: tools, status, error } = useSelector((state: RootState) => state.tools);

  if (status === 'loading') {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">Loading tools...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          Error loading tools: {typeof error === 'string' ? error : (error as any).message || 'Unknown error'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Available Tools
      </Typography>
      <Typography variant="body1" paragraph>
        Select a tool to learn more about its capabilities and how to use it with your notes.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {tools.map((tool: Tool) => (
          <Grid item xs={12} sm={6} md={4} key={tool.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardActionArea>
                <CardMedia
                  component="div"
                  sx={{
                    height: 140,
                    backgroundColor: tool.type === 'grammar' ? '#4caf50' :
                      tool.type === 'sentiment' ? '#2196f3' :
                      tool.type === 'summary' ? '#ff9800' : '#9c27b0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h5" color="white">
                    {tool.type.toUpperCase()}
                  </Typography>
                </CardMedia>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {tool.name}
                  </Typography>
                  <Typography>
                    {tool.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Status: {tool.status}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {tools.length === 0 && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6">No tools available</Typography>
          <Typography variant="body2">
            There are currently no processing tools available. Please check back later.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ToolsPage;
