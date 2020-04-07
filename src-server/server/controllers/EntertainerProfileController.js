import Sequelize, { Op } from 'sequelize';
import { updateUser } from '../utils';
import {
  User,
  EntertainerProfile,
  Gallery,
  Video,
  EventEntertainer,
  Application,
} from '../models';
import { USER_TYPES } from '../constant';
import { getAll } from '../utils/modelHelper';

export const userAssociatedModels = [
  {
    model: EntertainerProfile,
    as: 'profile',
  },
];

export const entertainerProfileAssociatedModels = [
  {
    model: User,
    as: 'personalDetails',
  },
];

const EntertainerProfileController = {
  /**
   * update User And Entertainer Profile
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  updateUserAndEntertainerProfile(req, res) {
    const {
      about,
      city,
      baseCharges,
      preferredCharges,
      availableFor,
      location,
      stageName,
      yearStarted,
      willingToTravel,
      eventType,
      entertainerType,
      youTubeChannel,
    } = req.body;
    const entertainerProfileData = {
      about,
      city,
      baseCharges,
      preferredCharges,
      availableFor,
      location,
      stageName,
      yearStarted,
      willingToTravel,
      eventType,
      entertainerType,
      youTubeChannel,
      slug: stageName
        ? `${stageName}-${req.user.dataValues.id}`
        : `${req.user.dataValues.id}`,
    };

    updateUser(req.user, entertainerProfileData, 'Profile')
      .then((entertainerProfile) => {
        return res.status(200).json({
          message: 'User profile update is succesful',
          entertainerProfile,
        });
      })
      .catch((error) => {
        return res.status(error.status || 400).json({ message: error.message });
      });
  },

  transformEntertainers(entertainer, updatedValues = {}) {
    const transformEntertainer = {
      id: entertainer.id,
      firstName: entertainer.firstName,
      lastName: entertainer.lastName,
      type: entertainer.type,
      profileImg: entertainer.profileImageURL,
      stageName: entertainer.profile.stageName,
      entertainerType: entertainer.profile.entertainerType,
      slug: entertainer.profile.slug,
    };

    return { ...transformEntertainer, ...updatedValues };
  },

  getEntertainers(req, res) {
    User.findAll({
      where: { type: USER_TYPES.ENTERTAINER },
      include: userAssociatedModels,
    })
      .then((entertainers) => {
        return res.status(200).json({
          message: 'Entertainers List',
          entertainers: entertainers.map((entertainer) =>
            EntertainerProfileController.transformEntertainers(entertainer)
          ),
        });
      })
      .catch((error) => {
        const status = error.status || 500;
        const errorMessage = error.message || error;
        return res.status(status).json({ message: errorMessage });
      });
  },

  transformEntertainer(entertainer, updatedValues = {}) {
    const transformEntertainer = {
      id: entertainer.personalDetails.id,
      firstName: entertainer.personalDetails.firstName,
      lastName: entertainer.personalDetails.lastName,
      type: entertainer.personalDetails.type,
      about: entertainer.about,
      profileImg: entertainer.personalDetails.profileImageURL,
      stageName: entertainer.stageName,
      entertainerType: entertainer.entertainerType,
      slug: entertainer.slug,
    };

    return { ...transformEntertainer, ...updatedValues };
  },

  getEntertainerBySlug(req, res) {
    const { slug } = req.params;
    User.findOne({
      attributes: ['id', 'firstName', 'lastName', 'profileImageURL'],
      include: [
        {
          model: EntertainerProfile,
          as: 'profile',
          where: { slug },
        },
        {
          model: Gallery,
          as: 'galleries',
          attributes: ['id', 'imageURL', 'imageID', 'approved'],
          required: false,
        },
        {
          model: Video,
          as: 'videos',
          attributes: ['id', 'title', 'youtubeID', 'approved'],
          required: false,
        },
      ],
    })
      .then((entertainer) => {
        User.findAll({
          order: [Sequelize.fn('RANDOM')],
          limit: 3,
          include: [
            {
              where: {
                [Op.and]: [
                  { entertainerType: entertainer.profile.entertainerType },
                  {
                    slug: { [Op.ne]: slug },
                  },
                ],
              },
              model: EntertainerProfile,
              as: 'profile',
            },
          ],
        }).then((otherEntertainers) => {
          return res.status(200).json({
            message: 'Entertainer detail',
            entertainer,
            otherEntertainers: otherEntertainers.map((entertainer) =>
              EntertainerProfileController.transformEntertainers(entertainer)
            ),
          });
        });
      })
      .catch((error) => {
        const status = error.status || 500;
        const errorMessage = error.message || error;
        return res.status(status).json({ message: errorMessage });
      });
  },

  async searchForEntertainer(req, res) {
    const name = req.query.name;
    if (name) {
      if (name.length < 2) {
        return res
          .status(412)
          .send({ msg: 'Your search term must exceed 2 characters' });
      }
    }

    // const userQuery = {
    //   [Op.or]: [
    //     { firstName: { [Op.iLike]: `%${name}%` } },
    //     { lastName: { [Op.iLike]: `%${name}%` } },
    //   ],
    // };

    const entertainerQuery = {
      stageName: { [Op.iLike]: `%${name}%` },
    };

    const include = [
      {
        model: EntertainerProfile,
        as: 'profile',
        where: entertainerQuery,
      },
    ];

    try {
      const { result, pagination } = await getAll(User, {
        // where: userQuery,
        include,
        limit: 6,
      });
      const entertainers = result.reduce((acc, user) => {
        const entertainer = {
          profileImageURL: user.profileImageURL,
          stageName: user.profile.stageName,
          about: user.profile.about,
          location: user.profile.location,
          yearnStarted: user.profile.yearnStarted,
          willingToTravel: user.profile.willingToTravel,
          baseCharges: user.profile.baseCharges,
          preferredCharges: user.profile.preferredCharges,
          slug: user.profile.slug,
          availableFor: user.profile.availableFor,
        };
        return [...acc, entertainer];
      }, []);
      return res.status(200).json({ entertainers, pagination });
    } catch (error) {
      const status = error.status || 500;
      const errorMessage = error.message || error;
      return res.status(status).json({ message: errorMessage });
    }
  },

  /**
   * search for entertainer from event
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  async searchForEntertainersFromEvents(req, res) {
    const eventEntertainerId = req.params.eventEntertainerId;
    try {
      const eventEntertainer = await EventEntertainer.findOne({
        where: { id: eventEntertainerId },
      });
      EventEntertainer.findAll({
        where: {
          userId: req.user.id,
          entertainerType: eventEntertainer.entertainerType,
        },
        include: [
          {
            model: Application,
            as: 'applications',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'profileImageURL'],
                include: [
                  {
                    model: EntertainerProfile,
                    as: 'profile',
                  },
                ],
              },
            ],
          },
        ],
      }).then((events) => {
        if (!events || events.length === 0) {
          return res
            .status(404)
            .json({ message: 'No previous entertainer found' });
        }
        const entertainers = events.reduce((acc, event) => {
          const entertainer = event.applications.map(({ user }) => ({
            profileImageURL: user.profileImageURL,
            stageName: user.profile.stageName,
            about: user.profile.about,
            location: user.profile.location,
            yearStarted: user.profile.yearStarted,
            willingToTravel: user.profile.willingToTravel,
            baseCharges: user.profile.baseCharges,
            preferredCharges: user.profile.preferredCharges,
            slug: user.profile.slug,
            availableFor: user.profile.availableFor,
          }));
          return [...acc, ...entertainer];
        }, []);
        return res.status(200).json({ entertainers });
      });
    } catch (error) {
      const status = error.status || 500;
      const errorMessage = error.message || error;
      return res.status(status).json({ message: errorMessage });
    }
  },

  /**
   * recommend entertainer from event
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  async recommendEntertainer(req, res) {
    // const eventEntertainerId = req.params.eventEntertainerId;
    // const entertainerQuery = {
    //   stageName: { [Op.iLike]: `%${name}%` },
    // };
    try {
      // const eventEntertainer = await EventEntertainer.findOne({
      //   where: { id: eventEntertainerId },
      // });

      const entertainerQuery = {
        stageName: { [Op.iLike]: `%wor%` },
      };

      const include = [
        {
          model: EntertainerProfile,
          as: 'profile',
          where: entertainerQuery,
        },
      ];

      try {
        const { result, pagination } = await getAll(User, {
          include,
          limit: 6,
        });
        const entertainers = result.reduce((acc, user) => {
          const entertainer = {
            profileImageURL: user.profileImageURL,
            stageName: user.profile.stageName,
            about: user.profile.about,
            location: user.profile.location,
            yearnStarted: user.profile.yearnStarted,
            willingToTravel: user.profile.willingToTravel,
            baseCharges: user.profile.baseCharges,
            preferredCharges: user.profile.preferredCharges,
            slug: user.profile.slug,
            availableFor: user.profile.availableFor,
          };
          return [...acc, entertainer];
        }, []);
        return res.status(200).json({ entertainers, pagination });
      } catch (error) {
        const status = error.status || 500;
        const errorMessage = error.message || error;
        return res.status(status).json({ message: errorMessage });
      }
    } catch (error) {
      const status = error.status || 500;
      const errorMessage = error.message || error;
      return res.status(status).json({ message: errorMessage });
    }
  },

  getTotalEntertainers(req, res) {
    EntertainerProfile.findAll()
      .then((entertainers) => {
        return res.status(200).json({
          message: 'Total Entertainers',
          entertainers: entertainers.reduce(
            (acc, entertainer) => {
              if (entertainer.entertainerType === 'MC') {
                acc['mc'] += 1;
              }
              if (entertainer.entertainerType === 'DJ') {
                acc['dj'] += 1;
              }
              if (entertainer.entertainerType === 'Liveband') {
                acc['liveband'] += 1;
              }
              return acc;
            },
            { mc: 0, dj: 0, liveband: 0 }
          ),
        });
      })
      .catch((error) => {
        const status = error.status || 500;
        const errorMessage = error.message || error;
        return res.status(status).json({ message: errorMessage });
      });
  },
};

export default EntertainerProfileController;
