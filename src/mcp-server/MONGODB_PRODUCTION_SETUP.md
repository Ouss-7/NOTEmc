# Secure MongoDB Production Setup Guide

## Overview

This guide provides detailed instructions for securely setting up MongoDB for your Note application in a production environment. Following these best practices will help protect your data and ensure reliable database operations.

## 1. MongoDB Atlas Setup (Recommended)

### 1.1 Create a MongoDB Atlas Account

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a new organization if needed
3. Create a new project for your Note application

### 1.2 Create a Cluster

1. Click "Build a Database"
2. Choose your preferred cloud provider (AWS, GCP, or Azure)
3. Select a region closest to your application servers
4. Choose an appropriate tier (M0 is free for development, M10+ recommended for production)
5. Name your cluster (e.g., "note-app-production")

### 1.3 Configure Security Settings

1. **Create a Database User**:
   - Go to Security → Database Access → Add New Database User
   - Username: `note_app_user` (use a more unique name in production)
   - Password: Generate a strong password (16+ characters)
   - Authentication Method: Password
   - Database User Privileges: Select "Read and write to any database"

2. **Network Access**:
   - Go to Security → Network Access → Add IP Address
   - For development: Add your current IP address
   - For production: Add the IP addresses of your application servers
   - If using a cloud provider with dynamic IPs, consider VPC peering

## 2. Connection String

### 2.1 Get Your Connection String

1. Go to your cluster dashboard
2. Click "Connect"
3. Choose "Connect your application"
4. Select Node.js as your driver
5. Copy the connection string

### 2.2 Update Your .env File

Replace the placeholder values in your .env file with your actual MongoDB Atlas credentials:

```
MONGODB_URI=mongodb+srv://note_app_user:YOUR_STRONG_PASSWORD@your-cluster.mongodb.net/note_app_db?retryWrites=true&w=majority&ssl=true
```

## 3. Run the Setup Script

Run the MongoDB Atlas setup script to create necessary indexes and initial data:

```bash
node scripts/setup-mongodb-atlas.js
```

## 4. Security Best Practices

### 4.1 Database User Security

- Use strong, unique passwords for database users
- Create separate users with appropriate permissions for different services
- Regularly rotate database credentials
- Store credentials securely using environment variables or a secrets manager

### 4.2 Network Security

- Use IP whitelisting to restrict access to your MongoDB cluster
- For cloud deployments, use VPC peering when possible
- Enable TLS/SSL for all connections
- Consider using a VPN for additional security

### 4.3 Data Security

- Enable client-side field level encryption for sensitive data
- Set up automatic backups (daily for production)
- Test your backup restoration process regularly
- Consider enabling MongoDB Atlas Advanced Security features

### 4.4 Monitoring and Alerts

- Set up monitoring for your MongoDB cluster
- Configure alerts for unusual activity
- Regularly review database logs
- Monitor performance metrics

## 5. Self-Hosted MongoDB Alternative

If you prefer to self-host MongoDB instead of using Atlas:

### 5.1 Server Requirements

- Dedicated server with adequate resources
- Linux-based OS (Ubuntu Server recommended)
- Firewall configured to only allow connections from application servers

### 5.2 Installation

```bash
# Install MongoDB on Ubuntu
sudo apt-get update
sudo apt-get install -y mongodb-org

# Enable and start MongoDB service
sudo systemctl enable mongod
sudo systemctl start mongod
```

### 5.3 Security Configuration

1. **Enable Authentication**:
   Edit `/etc/mongod.conf` to include:

   ```yaml
   security:
     authorization: enabled
   ```

2. **Create Admin User**:

   ```javascript
   use admin
   db.createUser({
     user: "admin",
     pwd: "secure_password",
     roles: [{ role: "userAdminAnyDatabase", db: "admin" }]
   })
   ```

3. **Create Application User**:

   ```javascript
   use note_app_db
   db.createUser({
     user: "note_app_user",
     pwd: "another_secure_password",
     roles: [{ role: "readWrite", db: "note_app_db" }]
   })
   ```

4. **Enable TLS/SSL**:
   Generate certificates and configure MongoDB to use them.

## 6. Deployment Checklist

- [ ] Database user created with minimal required permissions
- [ ] Network access restricted to application servers only
- [ ] Connection string updated in environment variables
- [ ] Indexes created for optimal performance
- [ ] Monitoring and alerts configured
- [ ] Backup strategy implemented and tested
- [ ] Security settings reviewed and hardened

## 7. Troubleshooting

### Common Connection Issues

1. **Connection Timeout**:
   - Check network access settings
   - Verify IP whitelist includes your application server

2. **Authentication Failed**:
   - Verify username and password
   - Check that user has access to the specific database

3. **SSL/TLS Issues**:
   - Ensure your application is configured to use SSL
   - Check certificate validity

### Getting Help

- MongoDB Atlas Documentation: [https://docs.atlas.mongodb.com/](https://docs.atlas.mongodb.com/)
- MongoDB Community Forums: [https://community.mongodb.com/](https://community.mongodb.com/)
- MongoDB Support: [https://support.mongodb.com/](https://support.mongodb.com/)
