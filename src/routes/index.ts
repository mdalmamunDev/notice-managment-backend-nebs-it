import express from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { SettingsRoutes } from '../modules/settings/settings.routes';
import { UploadRoutes } from '../modules/upload/upload.routes';
import { NotificationRoutes } from '../modules/notification/notification.routes';
import { DashboardRoutes } from '../modules/dashboard/dashboard.routes';
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

  // {
  //   path: '/report',
  //   route: ReportRoutes,
  // },
  // {
  //   path: '/contact',
  //   route: ContactRoutes,
  // },
  {
    path: '/setting',
    route: SettingsRoutes,
  },
  {
    path: '/upload',
    route: UploadRoutes,
  },
  {
    path: '/notification',
    route: NotificationRoutes
  },
  // {
  //   path: '/message',
  //   route: MessageRoutes
  // },
  {
    path: '/dashboard',
    route: DashboardRoutes
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
