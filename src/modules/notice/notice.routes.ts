import { Router } from 'express';
import auth from '../../middlewares/auth';
import NoticeController from './notice.controller';

const router = Router();

// admin only routes
router.post('/', auth(['admin']), NoticeController.create);
router.put('/:id', auth(['admin']), NoticeController.update);
router.patch('/:id/status', auth(['admin']), NoticeController.updateStatus);
router.delete('/:id', auth(['admin']), NoticeController.delete);

// public routes (with authentication)
router.get('/', auth('common'), NoticeController.getAll);
router.get('/my-notices', auth('common'), NoticeController.getMyNotices);
router.get('/:id', auth('common'), NoticeController.getSingle);

export const NoticeRoutes = router;