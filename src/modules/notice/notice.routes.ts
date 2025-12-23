import { Router } from 'express';
import auth from '../../middlewares/auth';
import NoticeController from './notice.controller';

const router = Router();

// admin only routes
router.post('/', auth(['admin']), NoticeController.create);
router.put('/:id', auth(['admin']), NoticeController.update);
router.patch('/:id/status', auth(['admin']), NoticeController.updateStatus);
router.delete('/:id', auth(['admin']), NoticeController.delete);
router.get('/', auth(['admin']), NoticeController.getAll);

// public routes (with authentication)
router.get('/my-notices', auth('common'), NoticeController.getMyNotices);
router.get('/:id', auth('common'), NoticeController.getSingle);

export const NoticeRoutes = router;