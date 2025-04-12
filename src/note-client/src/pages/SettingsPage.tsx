import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  Snackbar,
  List,
  ListItem,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { API_CONFIG, FEATURES } from '../config';

const SettingsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // State for settings
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<boolean>(FEATURES.ENABLE_NOTIFICATIONS);
  const [offlineMode, setOfflineMode] = useState<boolean>(FEATURES.ENABLE_OFFLINE_MODE);
  const [apiUrl, setApiUrl] = useState<string>(API_CONFIG.BASE_URL);
  
  // State for feedback
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleSaveSettings = () => {
    // In a real app, this would save to localStorage or backend
    setSuccessMessage('Settings saved successfully!');
    setShowSuccess(true);
  };
  
  const handleCloseSnackbar = () => {
    setShowSuccess(false);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          User Profile
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {user ? (
          <Box sx={{ mb: 3 }}>
            <TextField
              label="Username"
              value={user.username}
              fullWidth
              margin="normal"
              disabled
            />
            <TextField
              label="Email"
              value={user.email}
              fullWidth
              margin="normal"
              disabled
            />
            <TextField
              label="Full Name"
              value={`${user.firstName} ${user.lastName}`}
              fullWidth
              margin="normal"
              disabled
            />
            <Typography variant="caption" color="text.secondary">
              To update your profile information, please contact support.
            </Typography>
          </Box>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            Please log in to view and manage your profile settings.
          </Alert>
        )}
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Application Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <List>
          <ListItem>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                />
              }
              label="Dark Mode"
            />
          </ListItem>
          
          <ListItem>
            <FormControlLabel
              control={
                <Switch
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
              }
              label="Enable Notifications"
            />
          </ListItem>
          
          <ListItem>
            <FormControlLabel
              control={
                <Switch
                  checked={offlineMode}
                  onChange={(e) => setOfflineMode(e.target.checked)}
                />
              }
              label="Offline Mode"
            />
          </ListItem>
        </List>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          API Configuration
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <TextField
          label="API URL"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          fullWidth
          margin="normal"
        />
        
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={API_CONFIG.USE_MOCK}
                disabled
              />
            }
            label="Use Mock Data"
          />
          <Typography variant="caption" display="block" color="text.secondary">
            This setting is controlled by environment variables and cannot be changed here.
          </Typography>
        </Box>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSaveSettings}>
          Save Settings
        </Button>
      </Box>
      
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
