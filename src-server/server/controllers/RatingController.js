import Sequelize from 'sequelize';
import { EntertainerProfile, EventEntertainer, Rating, User } from '../models';
import { validString } from '../utils';

const RatingController = {
  /**
   * create and update Rating
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  updateUserRating(req, res) {
    const {
      entertainerId,
      eventEntertainerId,
      professionalism,
      accommodating,
      overallTalent,
      recommend,
      review = '',
      id,
    } = req.body;

    const error = {
      ...validString(professionalism),
      ...validString(accommodating),
      ...validString(accommodating),
      ...validString(overallTalent),
      ...validString(recommend),
    };

    if (Object.keys(error).length > 1) {
      return res.status(400).json({ message: error.message.join('') });
    }
    let newRating = {};
    if (!id) {
      return Rating.create({
        entertainerId,
        eventEntertainerId,
        professionalism,
        accommodating,
        overallTalent,
        recommend,
        review,
        userId: req.user.id,
      })
        .then((rating) => {
          newRating = rating;
          return req.user.addRating(rating);
        })
        .then(() => {
          return res.status(200).json({
            message: 'Rating created successfully',
            rating: newRating,
          });
        })
        .catch((error) => {
          const status = error.status || 500;
          const errorMessage =
            (error.parent && error.parent.detail) || error.message || error;
          return res.status(status).json({ message: errorMessage });
        });
    }
    return req.user
      .getRatings({ where: { id } })
      .then((ratings) => {
        if (ratings && ratings.length > 0) {
          return ratings[0].update({
            entertainerId,
            professionalism,
            accommodating,
            overallTalent,
            recommend,
          });
        }
        throw `No rating with id ${id}`;
      })
      .then((rating) => {
        return res.status(200).json({
          message: 'Rating updated successfully',
          rating,
        });
      })
      .catch((error) => {
        const status = error.status || 500;
        const errorMessage = error.message || error;
        return res.status(status).json({ message: errorMessage });
      });
  },

  /**
   * get User Rating
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getUserRatings(req, res) {
    req.user
      .getRatings({
        include: [
          {
            model: User,
            as: 'rater',
            attributes: ['id', 'firstName', 'lastName', 'profileImageURL'],
          },
          {
            model: EntertainerProfile,
            as: 'rated',
            attributes: ['id', 'slug'],
            include: [
              {
                model: User,
                as: 'personalDetails',
                attributes: ['id', 'firstName', 'lastName', 'profileImageURL'],
              },
            ],
          },
          {
            model: EventEntertainer,
            as: 'ratedEvent',
          },
        ],
      })
      .then((ratings) => {
        if (!ratings || ratings.length === 0) {
          return res.status(404).json({ message: 'Rating not found' });
        }
        return res.status(200).json({ ratings });
      });
  },

  /**
   * get one Rating details
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getOneRating(req, res) {
    const ratingId = req.params.id;
    if (!ratingId) {
      return res.status(400).json({ message: 'Kindly provide a rating id' });
    }
    Rating.findOne({
      where: { id: ratingId },
      include: [
        {
          model: User,
          as: 'rater',
          attributes: ['id', 'firstName', 'lastName', 'profileImageURL'],
        },
        {
          model: EntertainerProfile,
          as: 'rated',
          attributes: ['id', 'slug'],
          include: [
            {
              model: User,
              as: 'personalDetails',
              attributes: ['id', 'firstName', 'lastName', 'profileImageURL'],
            },
          ],
        },
        {
          model: EventEntertainer,
          as: 'ratedEvent',
        },
      ],
    })
      .then((rating) => {
        if (!rating) {
          return res.status(404).json({ message: 'Rating not found' });
        }

        return res.json({ rating });
      })
      .catch((error) => {
        return res.status(500).json({ message: error.message });
      });
  },

  /**
   * get average User Rating
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getAverageEntertainerRatings(req, res) {
    req.user
      .getRatings({
        attributes: [
          [
            Sequelize.fn('AVG', Sequelize.col('professionalism')),
            'avgProfessionalism',
          ],
          [
            Sequelize.fn('AVG', Sequelize.col('accommodating')),
            'avgAccommodating',
          ],
          [
            Sequelize.fn('AVG', Sequelize.col('overallTalent')),
            'avgOverallTalent',
          ],
          [Sequelize.fn('AVG', Sequelize.col('recommend')), 'avgRecommend'],
        ],
        raw: true,
      })
      .then((avgRatings) => {
        if (!avgRatings || avgRatings.length === 0) {
          return res.status(404).json({ message: 'Average Rating not found' });
        }
        return res.status(200).json({ avgRatings });
      });
  },

  /**
   * get Entertainer Ratings
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getEntertainerRatings(req, res) {
    const userId = req.user.id;
    EntertainerProfile.findOne({
      where: {
        userId,
      },
    })
      .then((entertainer) => {
        Rating.findAll({
          where: {
            entertainerId: entertainer.id,
          },
          include: [
            {
              model: EventEntertainer,
              as: 'ratedEvent',
            },
            {
              model: User,
              as: 'rater',
              attributes: ['id', 'firstName', 'lastName', 'profileImageURL'],
            },
          ],
        })
          .then((ratings) => {
            if (!ratings) {
              return res.status(404).json({ message: 'Rating not found' });
            }
            return res.status(200).json({ ratings });
          })
          .catch((error) => {
            const errorMessage = error.message || error;
            return res.status(412).json({ message: errorMessage });
          });
      })
      .catch((error) => {
        const errorMessage = error.message || error;
        return res.status(412).json({ message: errorMessage });
      });
  },

  /**
   * get One Entertainer Rating
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getOneEntertainerRating(req, res) {
    const userId = req.user.id;
    const id = req.params.id;
    EntertainerProfile.findOne({
      where: {
        userId,
      },
    })
      .then((entertainer) => {
        Rating.findOne({
          where: {
            id,
            entertainerId: entertainer.id,
          },
          include: [
            {
              model: EventEntertainer,
              as: 'ratedEvent',
            },
            {
              model: User,
              as: 'rater',
              attributes: ['id', 'firstName', 'lastName', 'profileImageURL'],
            },
          ],
        })
          .then((ratings) => {
            if (!ratings) {
              return res.status(404).json({ message: 'Rating not found' });
            }
            return res.status(200).json({ ratings });
          })
          .catch((error) => {
            const errorMessage = error.message || error;
            return res.status(412).json({ message: errorMessage });
          });
      })
      .catch((error) => {
        const errorMessage = error.message || error;
        return res.status(412).json({ message: errorMessage });
      });
  },
};

export default RatingController;
