import { EntertainerProfileController } from '../controllers';
import Authentication from '../middleware/authentication';

const entertainerRoutes = (router) => {
  router
    .route('/api/v1/users/updateEntertainerProfile')
    .put(
      Authentication.verifyToken,
      Authentication.validateEntertainer,
      Authentication.isActiveUser,
      EntertainerProfileController.updateUserAndEntertainerProfile
    );

  router
    .route('/api/v1/entertainers/search')
    .get(
      Authentication.verifyToken,
      Authentication.isActiveUser,
      EntertainerProfileController.searchForEntertainer
    );

  router
    .route('/api/v1/entertainers/recommend')
    .get(
      Authentication.verifyToken,
      Authentication.isActiveUser,
      EntertainerProfileController.recommendEntertainer
    );

  router
    .route('/api/v1/entertainers/search/pastEvents/:eventEntertainerId')
    .get(
      Authentication.verifyToken,
      Authentication.isActiveUser,
      EntertainerProfileController.searchForEntertainersFromEvents
    );

  // Public APIS
  router
    .route('/api/v1/entertainers')
    .get(EntertainerProfileController.getEntertainers);

  router
    .route('/api/v1/entertainer/:slug')
    .get(EntertainerProfileController.getEntertainerBySlug);

  router
    .route('/api/v1/entertainers/total')
    .get(EntertainerProfileController.getTotalEntertainers);
};

export default entertainerRoutes;
