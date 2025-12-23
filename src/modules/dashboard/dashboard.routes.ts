import { Router } from 'express';
import auth from '../../middlewares/auth';
import DashboardController from './dashboard.controller';

const router = Router();
router.get('/', auth(['admin', 'sub_admin']), DashboardController.getDashboard);

export const DashboardRoutes = router;
