import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Divider,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useState } from 'react';

const ProfilePage: React.FC = () => {
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    username: string;
  }>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    username: user?.username || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would dispatch an action to update the user profile
    // For now, we'll just toggle editing mode off
    setIsEditing(false);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    // Reset form data when toggling to edit mode
    if (!isEditing && user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || '',
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">User not found. Please log in again.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
      
      <Paper sx={{ p: 3, mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              sx={{ width: 120, height: 120, mb: 2 }}
            >
              <AccountCircleIcon sx={{ fontSize: 80 }} />
            </Avatar>
            
            <Typography variant="h6">
              {user.firstName} {user.lastName}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              {user.role}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Member since: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box component="form" onSubmit={handleSubmit}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={isEditing ? formData.firstName : user.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={isEditing ? formData.lastName : user.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={isEditing ? formData.username : user.username}
                    onChange={handleChange}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={isEditing ? formData.email : user.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    margin="normal"
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                {isEditing ? (
                  <>
                    <Button 
                      variant="outlined" 
                      color="secondary" 
                      onClick={toggleEdit}
                      sx={{ mr: 1 }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary"
                    >
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={toggleEdit}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
