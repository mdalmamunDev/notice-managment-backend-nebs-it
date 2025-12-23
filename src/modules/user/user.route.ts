import express from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../shared/validateRequest';
import { updateUserStatusOrRoleSchema, updateUserValidationSchema } from './user.validation';

const router = express.Router();

//main routes
router.get('/', auth(['admin', 'sub_admin']), UserController.getAllUsers);
router.get('/admin', auth('admin'), UserController.getAllAdmins);
router.post('/admin', auth('admin'), UserController.addAdmin);
router.put('/admin/:id', auth('admin'), UserController.updateAdmin);
router.delete('/admin/:id', auth('admin'), UserController.deleteAdmin);

router.post('/connect-partner', auth('user'),  UserController.connectToPartner)

router
  .route('/:userId')
  .get(auth('common'), UserController.getSingleUser)
  .patch(
    auth('common'),
    validateRequest(updateUserValidationSchema),
    UserController.updateUserProfile
  )
  .put(auth(['admin', 'sub_admin']), validateRequest(updateUserStatusOrRoleSchema), UserController.updateUserStatusOrRole)
  .delete(auth('common'), UserController.deleteUserProfile);

export const UserRoutes = router;
