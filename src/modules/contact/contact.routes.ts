import { Router } from 'express';
import auth from '../../middlewares/auth';
import ContactController from './contact.controller';
import { ValidContact } from './contact.validation';
import validateRequest from '../../shared/validateRequest';

const router = Router();

// Public route - no authentication required
router.post('/', validateRequest(ValidContact.create), ContactController.create);

// Admin only routes
router.get('/', auth(['admin', 'sub_admin']), ContactController.getAll);
router.get('/stats', auth(['admin', 'sub_admin']), ContactController.getStats);
router.get('/:id', auth(['admin', 'sub_admin']), ContactController.getSingle);
router.put('/:id', validateRequest(ValidContact.update), auth(['admin', 'sub_admin']), ContactController.update);
router.patch('/mark-read', auth(['admin', 'sub_admin']), ContactController.markAsRead);
router.delete('/:id', auth(['admin', 'sub_admin']), ContactController.delete);

export const ContactRoutes = router;