import express from 'express';
import helloController from '../controllers/helloController.js';
import contactController from '../controllers/contactController.js';
import userController from '../controllers/userController.js';
import { logger } from '../../middleware/auth.js';

const router = express.Router();

// Apply logging middleware to all API routes
router.use(logger);

// Hello endpoint
router.get('/hello', helloController.getHello);

// Contact endpoints
router.post('/contact', contactController.submitContact);

// User endpoints
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.get('/users/:id/profile', userController.getUserProfile);
router.get('/users/:id/projects', userController.getUserProjects);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.put('/users/:id/profile', userController.updateUserProfile);
router.delete('/users/:id', userController.deleteUser);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Clean React Architecture API',
    version: '1.0.0',
    endpoints: {
      hello: 'GET /api/hello',
      contact: 'POST /api/contact',
      users: {
        getAll: 'GET /api/users',
        getById: 'GET /api/users/:id',
        getProjects: 'GET /api/users/:id/projects',
        create: 'POST /api/users',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id'
      }
    },
    timestamp: new Date().toISOString()
  });
});

export default router;