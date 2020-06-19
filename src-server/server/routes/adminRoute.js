import { AdminController } from '../controllers';
import Authentication from '../middleware/authentication';

const adminRoutes = (router) => {
  router.get(
    '/api/v1/admin/users',
    Authentication.verifyToken,
    Authentication.isActiveUser,
    Authentication.validateAdmin,
    AdminController.getAllUsers
  );

  router.get(
    '/api/v1/admin/user',
    Authentication.verifyToken,
    Authentication.isActiveUser,
    Authentication.validateAdmin,
    AdminController.getOneUser
  );
};

export default adminRoutes;
