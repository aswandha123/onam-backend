import express from 'express';
import {
    getDashboardStats,
    getTickets,
    getReports,
    getSettings,
    updateSettings,
    getDrawStatus,
    executeDraw,
    adminLogin
} from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', adminLogin);

router.get('/dashboard-stats', authMiddleware, getDashboardStats);
router.get('/tickets', authMiddleware, getTickets);
router.get('/reports', authMiddleware, getReports);
router.get('/settings', authMiddleware, getSettings);
router.put('/settings', authMiddleware, updateSettings);
router.get('/draw/status', authMiddleware, getDrawStatus);
router.post('/draw/execute', authMiddleware, executeDraw);

export default router;
