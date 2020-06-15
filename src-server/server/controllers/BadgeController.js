import { Op } from 'sequelize';
import { Badge, BadgeUser } from '../models';
import { validString, getAll } from '../utils';

const BadgeController = {
  /**
   * create Badge
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  createNewBadge(req, res) {
    const { title, color, description } = req.body;

    const error = {
      ...validString(title),
      ...validString(color),
      ...validString(description),
    };
    if (Object.keys(error).length > 1) {
      return res.status(400).json({ message: error.message.join('') });
    }

    return Badge.create({
      color,
      title,
      description,
      adminId: req.user.id,
    })
      .then((badge) => {
        return res.status(200).json({
          message: 'Badge created successfully',
          badge,
        });
      })
      .catch((error) => {
        const status = error.status || 500;
        const errorMessage =
          (error.parent && error.parent.detail) || error.message || error;
        return res.status(status).json({ message: errorMessage });
      });
  },

  /**
   * assign Badge
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  assignBadgeToUser(req, res) {
    const { userId, badgeId } = req.body;

    if (!userId || !badgeId) {
      return res
        .status(400)
        .json({ message: 'Badge ID and UserId needed to process' });
    }

    return BadgeUser.create({
      userId,
      badgeId,
    })
      .then((badge) => {
        return res.status(200).json({
          message: 'Badge created successfully',
          badge,
        });
      })
      .catch((error) => {
        const status = error.status || 500;
        const errorMessage =
          (error.parent && error.parent.detail) || error.message || error;
        return res.status(status).json({ message: errorMessage });
      });
  },

  /**
   * get User Badge
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getUserBadges(req, res) {
    const userId = req.user.id;
    return BadgeUser.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
      include: [
        {
          model: Badge,
          as: 'badge',
        },
      ],
    })
      .then((badges) => res.json({ badges }))
      .catch((error) => res.status(412).json({ message: error.message }));
  },

  /**
   * get All Badge
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  async getAllBadges(req, res) {
    const { color, title, offset, limit } = req.query;
    try {
      let badgeQuery = {};
      if (color) {
        badgeQuery.color = color;
      }
      if (title) {
        badgeQuery.title = { [Op.like]: `%${title}%` };
      }
      const options = {
        offset: offset || 0,
        limit: limit || 10,
        where: badgeQuery,
      };
      try {
        const { result, pagination } = await getAll(Badge, options);
        return res.status(200).json({ badges: result, pagination });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    } catch (error) {
      const status = error.status || 500;
      const errorMessage = error.message || error;
      return res.status(status).json({ message: errorMessage });
    }
  },

  /**
   * get All Badge Users
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  async getAllBadgeUsers(req, res) {
    const { badgeId, userId, offset, limit } = req.query;
    try {
      let badgeUserQuery = {};
      if (badgeId) {
        badgeUserQuery.badgeId = badgeId;
      }
      if (userId) {
        badgeUserQuery.userId = userId;
      }
      const options = {
        offset: offset || 0,
        limit: limit || 10,
        where: badgeUserQuery,
      };
      try {
        const { result, pagination } = await getAll(BadgeUser, options);
        return res.status(200).json({ badges: result, pagination });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    } catch (error) {
      const status = error.status || 500;
      const errorMessage = error.message || error;
      return res.status(status).json({ message: errorMessage });
    }
  },
};

export default BadgeController;
