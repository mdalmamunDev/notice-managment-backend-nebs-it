import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { UserService } from '../user/user.service';
import { SettingService } from '../settings/settings.service';

// get all Tools
class Controller {
  getDashboard = catchAsync(async (req, res) => {
    const { recentLimit = '20', year, month } = req.query;

    const [totalUsers, totalProvider, recentUsers] = await Promise.all([
      UserService.getTotalUsers('user'),
      UserService.getTotalUsers('provider'),
      UserService.getRecentUsers(parseInt(recentLimit as string, 10)),
    ]);

    sendResponse(res, { code: StatusCodes.OK, data: { totalUsers, totalProvider, recentUsers } });
  });
}

const DashboardController = new Controller();
export default DashboardController;
