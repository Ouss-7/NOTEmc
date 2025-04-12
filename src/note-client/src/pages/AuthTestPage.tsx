import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Alert, CircularProgress, Grid, Divider } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { logoutUser, getUserProfile } from '../store/authSlice';
import { authApi } from '../services/authService';

const AuthTestPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Load user profile on component mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getUserProfile());
    }
  }, [dispatch, isAuthenticated]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const testAuthToken = () => {
    const token = authApi.getToken();
    if (token) {
      setTestResult({
        success: true,
        message: `Authentication token exists: ${token.substring(0, 15)}...`
      });
    } else {
      setTestResult({
        success: false,
        message: 'No authentication token found'
      });
    }
  };

  const testUserData = () => {
    const userData = authApi.getCurrentUser();
    if (userData) {
      setTestResult({
        success: true,
        message: `User data exists: ${JSON.stringify(userData, null, 2)}`
      });
    } else {
      setTestResult({
        success: false,
        message: 'No user data found'
      });
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 3,
        backgroundColor: 'background.default',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 800,
          width: '100%',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'white' }}>
          Authentication Test
        </Typography>

        <Divider sx={{ my: 2, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
            Authentication Status
          </Typography>
          <Alert severity={isAuthenticated ? "success" : "warning"}>
            {isAuthenticated ? "You are authenticated" : "You are not authenticated"}
          </Alert>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message || 'An error occurred'}
          </Alert>
        )}

        {isAuthenticated && user && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
              User Information
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.7 }}>Username:</Typography>
                  <Typography variant="body1" sx={{ color: 'white' }}>{user.username}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.7 }}>Email:</Typography>
                  <Typography variant="body1" sx={{ color: 'white' }}>{user.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.7 }}>Name:</Typography>
                  <Typography variant="body1" sx={{ color: 'white' }}>{user.firstName} {user.lastName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.7 }}>Role:</Typography>
                  <Typography variant="body1" sx={{ color: 'white' }}>{user.role}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
            Authentication Tests
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                onClick={testAuthToken}
              >
                Test Auth Token
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                onClick={testUserData}
              >
                Test User Data
              </Button>
            </Grid>
          </Grid>
        </Box>

        {testResult && (
          <Alert severity={testResult.success ? "success" : "error"} sx={{ mb: 4, whiteSpace: 'pre-wrap' }}>
            {testResult.message}
          </Alert>
        )}

        <Divider sx={{ my: 2, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {isAuthenticated ? (
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleLogout}
              disabled={loading}
            >
              Logout
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              href="/login"
            >
              Go to Login
            </Button>
          )}
          <Button 
            variant="outlined" 
            color="primary" 
            href="/notes"
          >
            Go to Notes (Protected)
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AuthTestPage;
