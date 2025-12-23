import express from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { SettingsRoutes } from '../modules/settings/settings.routes';
import { UploadRoutes } from '../modules/upload/upload.routes';
import { NoticeRoutes } from '../modules/notice/notice.routes';
const router = express.Router();

const apiRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/notice',
    route: NoticeRoutes,
  },

  {
    path: '/setting',
    route: SettingsRoutes,
  },
  {
    path: '/upload',
    route: UploadRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
