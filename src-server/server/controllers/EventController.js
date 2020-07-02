import Sequelize, { Op } from 'sequelize';
import { Event } from '../models';
import { validString, getLongDate, getTime, getAll } from '../utils';
import {
  EventEntertainer,
  User,
  EntertainerProfile,
  Application,
  Rating,
  Notification,
  CancelEventEntertainer,
} from '../models';
import sendMail from '../MailSender';
import EMAIL_CONTENT from '../email-template/content';
import {
  APPLICATION_TYPE,
  EVENTDATE_FILTER,
  EVENT_HIRETYPE,
  NOTIFICATIONS,
  NOTIFICATION_TYPE,
} from '../constant';

const reviewsInclude = [
  {
    model: Event,
    as: 'event',
    where: {
      eventDate: {
        [Op.lte]: Sequelize.literal('NOW()'),
      },
    },
    attributes: ['id', 'eventDate', 'eventType', 'eventDuration'],
  },
  {
    model: EntertainerProfile,
    as: 'entertainer',
    attributes: ['id', 'slug', 'stageName', 'entertainerType', 'location'],
    include: [
      {
        model: User,
        as: 'personalDetails',
        attributes: ['id', 'profileImageURL'],
      },
    ],
  },
  {
    model: Rating,
    as: 'eventRating',
  },
];

const EventController = {
  /**
   * create Event
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  updateUserEvent(req, res) {
    const {
      eventType,
      eventDate,
      startTime,
      eventDuration,
      moreInformation,
      streetLine1,
      streetLine2,
      state,
      lga,
      city,
      landmark,
      description,
      id,
    } = req.body;

    const error = {
      ...validString(eventType),
      ...validString(eventDate),
      ...validString(startTime),
      ...validString(eventDuration),
      ...validString(moreInformation),
      ...validString(streetLine1),
      ...validString(streetLine2),
      ...validString(state),
      ...validString(lga),
      ...validString(city),
      ...validString(landmark),
      ...validString(description),
    };
    if (Object.keys(error).length > 1) {
      return res.status(400).json({ message: error.message.join('') });
    }
    let newEvent = {};
    if (!id) {
      return Event.create({
        eventType,
        eventDate,
        startTime,
        eventDuration,
        moreInformation,
        streetLine1,
        streetLine2,
        state,
        lga,
        city,
        landmark,
        description,
        userId: req.user.id,
      })
        .then((event) => {
          newEvent = event;
          return req.user.addEvent(event);
        })
        .then(() => {
          return res.status(200).json({
            message: 'Event created successfully',
            event: newEvent,
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
      .getEvents({ where: { id } })
      .then((events) => {
        if (events && events.length > 0) {
          return events[0].update({
            eventType,
            eventDate,
            startTime,
            eventDuration,
            moreInformation,
            streetLine1,
            streetLine2,
            state,
            lga,
            city,
            landmark,
            description,
          });
        }
        throw `No Event with id ${id}`;
      })
      .then((event) => {
        return res.status(200).json({
          message: 'Event updated successfully',
          event,
        });
      })
      .catch((error) => {
        const status = error.status || 500;
        const errorMessage = error.message || error;
        return res.status(status).json({ message: errorMessage });
      });
  },

  /**
   * event one details
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getOneEvent(req, res) {
    const eventId = req.params.id;
    if (!eventId) {
      return res.status(400).json({ message: 'Kindly provide an event id' });
    }
    Event.findOne({
      where: { id: eventId },
      include: [
        {
          model: EventEntertainer,
          as: 'entertainers',
          include: [
            {
              model: EntertainerProfile,
              as: 'entertainer',
              attributes: [
                'id',
                'stageName',
                'entertainerType',
                'location',
                'slug',
              ],
              include: [
                {
                  model: User,
                  as: 'personalDetails',
                  attributes: [
                    'id',
                    'firstName',
                    'lastName',
                    'profileImageURL',
                  ],
                },
              ],
            },
            {
              model: Application,
              as: 'applications',
              attributes: ['id', 'status'],
            },
          ],
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'profileImageURL'],
        },
      ],
    })
      .then((event) => {
        if (!event) {
          return res.status(404).json({ message: 'Event not found' });
        }

        return res.json({ event });
      })
      .catch((error) => {
        return res.status(500).json({ message: error.message });
      });
  },

  /**
   * get Event
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getUserEvent(req, res) {
    req.user.getEvents().then((events) => {
      if (!events || events.length === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }
      return res.status(200).json({ events });
    });
  },

  /**
   * get User Auction
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getUserAuctions(req, res) {
    EventEntertainer.findAll({
      where: {
        hireType: EVENT_HIRETYPE.AUCTION,
        userId: req.user.id,
        hiredEntertainer: null, // shown auctions with no hired Entertainer
      },
      include: [
        {
          model: Event,
          as: 'event',
        },
        {
          model: EntertainerProfile,
          as: 'entertainer',
          attributes: [
            'id',
            'stageName',
            'entertainerType',
            'location',
            'about',
          ],
          include: [
            {
              model: User,
              as: 'personalDetails',
              attributes: ['id', 'firstName', 'lastName', 'profileImageURL'],
            },
          ],
        },
        {
          model: Application,
          as: 'applications',
        },
      ],
    }).then((auctions) => {
      if (!auctions || auctions.length === 0) {
        return res.status(404).json({ message: 'Auction not found' });
      }
      return res.status(200).json({ auctions });
    });
  },

  /**
   * get User Requests
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getUserRequests(req, res) {
    const userId = req.user.id;
    Application.findAll({
      where: {
        applicationType: APPLICATION_TYPE.REQUEST,
      },
      include: [
        {
          model: Event,
          as: 'event',
          where: {
            userId,
          },
        },
        {
          model: EventEntertainer,
          as: 'eventEntertainerInfo',
          where: {
            hiredEntertainer: null, // shown requests with no hired Entertainer
          },
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'profileImageURL'],
          include: [
            {
              model: EntertainerProfile,
              as: 'profile',
              attributes: ['id', 'stageName', 'slug'],
            },
          ],
        },
      ],
    }).then((requests) => {
      if (!requests || requests.length === 0) {
        return res.status(404).json({ message: 'No request found' });
      }
      return res.status(200).json({ requests });
    });
  },

  /**
   * get Available Auctions
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getAvailableAuctions(req, res) {
    EventEntertainer.findAll({
      where: {
        hireType: EVENT_HIRETYPE.AUCTION,
        auctionStartDate: { [Op.lte]: Sequelize.literal('NOW()') },
        auctionEndDate: { [Op.gte]: Sequelize.literal('NOW()') },
        entertainerType: {
          [Op.eq]: req.user.profile.entertainerType,
        },
        [Op.and]: Sequelize.literal('applications.id is null'), // only auctions without applications should be shown
      },
      include: [
        {
          model: Event,
          as: 'event',
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'firstName', 'lastName', 'profileImageURL'],
            },
          ],
        },
        {
          model: Application,
          as: 'applications',
          where: { userId: req.user.id },
          required: false,
        },
      ],
    }).then((events) => {
      if (!events || events.length === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }
      return res.status(200).json({ events });
    });
  },

  /**
   * get One Event for Entertainer
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getOneEntertainerEvent(req, res) {
    const userId = req.user.id;
    const id = req.params.eventEntertainerId;
    return EntertainerProfile.findOne({
      where: {
        userId,
      },
    })
      .then((entertainer) => {
        EventEntertainer.findOne({
          where: {
            id,
            hiredEntertainer: entertainer.id,
          },
          include: [
            {
              model: Event,
              as: 'event',
              include: [
                {
                  model: User,
                  as: 'owner',
                  attributes: [
                    'id',
                    'firstName',
                    'lastName',
                    'phoneNumber',
                    'phoneNumber2',
                    'profileImageURL',
                  ],
                },
              ],
            },
          ],
        })
          .then((event) => {
            if (!event) {
              return res.status(404).json({ message: 'Event not found' });
            }
            return res.status(200).json({ event });
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
   * get Entertainer Event
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getEntertainerEvents(req, res) {
    const userId = req.user.id;
    EntertainerProfile.findOne({
      where: {
        userId,
      },
    }).then((entertainer) => {
      EventEntertainer.findAll({
        where: {
          hiredEntertainer: entertainer.id,
        },
        include: [
          {
            model: Event,
            as: 'event',
            include: [
              {
                model: User,
                as: 'owner',
                attributes: ['id', 'firstName', 'lastName', 'profileImageURL'],
              },
            ],
          },
        ],
      }).then((events) => {
        if (!events || events.length === 0) {
          return res.status(404).json({ message: 'Events not found' });
        }
        return res.status(200).json({ events });
      });
    });
  },

  /**
   * get One Pending Event Review
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getOnePendingEventReview(req, res) {
    const userId = req.user.id;

    EventEntertainer.findOne({
      where: {
        userId,
        hiredEntertainer: {
          [Op.ne]: null,
        },
        [Op.and]: Sequelize.literal(`"eventRating"."id" is null`),
      },
      order: [Sequelize.fn('RANDOM')],
      attributes: ['id', 'placeOfEvent'],
      include: reviewsInclude,
    }).then((info) => {
      if (!info || info.length === 0) {
        return res.json({ message: 'You have no pending review', info: [] });
      }
      return res.status(200).json({ info });
    });
  },

  /**
   * get All Events Review
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getAllEventsReview(req, res) {
    const userId = req.user.id;

    EventEntertainer.findAll({
      where: {
        userId,
        hiredEntertainer: {
          [Op.ne]: null,
        },
      },
      order: [[{ model: Event, as: 'event' }, 'eventDate', 'DESC']],
      attributes: ['id', 'placeOfEvent'],
      include: reviewsInclude,
    }).then((info) => {
      if (!info || info.length === 0) {
        return res
          .status(404)
          .json({ message: 'Event Entertainers not found' });
      }
      return res.status(200).json({ info });
    });
  },

  /**
   * get Event Bids (for user)
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getEventBids(req, res) {
    const eventEntertainerId = req.params.id;
    if (!eventEntertainerId) {
      return res
        .status(400)
        .json({ message: 'Kindly provide an event entertainer id' });
    }
    EventEntertainer.findOne({
      where: {
        id: eventEntertainerId,
        userId: req.user.id,
      },
      include: [
        {
          model: Event,
          as: 'event',
        },
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
                  attributes: [
                    'id',
                    'stageName',
                    'slug',
                    'entertainerType',
                    'location',
                    'about',
                  ],
                  include: [
                    {
                      model: Rating,
                      as: 'ratings',
                      required: false,
                      where: {
                        review: {
                          [Op.ne]: null,
                        },
                      },
                      attributes: [
                        'id',
                        'professionalism',
                        'accommodating',
                        'overallTalent',
                        'recommend',
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }).then((eventEntertainer) => {
      if (!eventEntertainer) {
        return res.status(404).json({ message: 'Event Entertainer not found' });
      }

      if (eventEntertainer.hiredEntertainer) {
        return res
          .status(400)
          .json({ message: 'An entertainer has already been hired' });
      }
      return res.status(200).json({ eventEntertainer });
    });
  },

  /**
   * get Auction Details
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getAuctionDetails(req, res) {
    const eventId = req.params.id;
    if (!eventId) {
      return res.status(400).json({ message: 'Kindly provide an event id' });
    }
    Event.findOne({
      where: { id: eventId },
      include: [
        {
          model: EventEntertainer,
          as: 'entertainers',
          include: [
            {
              model: EntertainerProfile,
              as: 'entertainer',
              attributes: [
                'id',
                'stageName',
                'entertainerType',
                'location',
                'about',
              ],
              include: [
                {
                  model: User,
                  as: 'personalDetails',
                  attributes: [
                    'id',
                    'firstName',
                    'lastName',
                    'profileImageURL',
                  ],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'profileImageURL'],
        },
      ],
    })
      .then((event) => {
        if (!event) {
          return res.status(404).json({ message: 'Event not found' });
        }

        return res.json({ event });
      })
      .catch((error) => {
        return res.status(500).json({ message: error.message });
      });
  },

  cancelEvent(req, res) {
    const id = req.params.id;
    const userId = req.user.id;
    const cancelledReason = req.body.cancelledReason;

    if (!id) {
      return res.status(404).json({
        message: 'EventId is required to cancel event',
      });
    }

    Event.findOne({
      where: {
        id,
        userId, //need to ensure the owner of the event is making this request
      },
      include: [
        {
          model: EventEntertainer,
          as: 'entertainers',
          include: [
            {
              required: true,
              model: EntertainerProfile,
              as: 'entertainer',
              attributes: [
                'id',
                'stageName',
                'entertainerType',
                'location',
                'about',
              ],
              include: [
                {
                  model: User,
                  as: 'personalDetails',
                  attributes: [
                    'id',
                    'firstName',
                    'lastName',
                    'email',
                    'profileImageURL',
                  ],
                },
              ],
            },
            {
              model: Application,
              as: 'applications',
              attributes: ['id', 'proposedPrice', 'askingPrice'],
            },
          ],
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'profileImageURL'],
        },
      ],
    })
      .then(async (event) => {
        if (!event) {
          return res.status(404).json({ message: 'Event not found' });
        }

        if (event.cancelled) {
          return res
            .status(401)
            .json({ message: 'Event has already been cancelled' });
        }

        // update event details
        event.update({
          cancelled: true,
          cancelledDate: Date.now(),
          cancelledReason,
        });

        // Add User notification
        await Notification.create({
          userId: userId,
          title: NOTIFICATIONS.USER_CANCEL_EVENT,
          description: `You CANCELLED ${event.eventType}`,
          type: NOTIFICATION_TYPE.DANGER,
          actionId: event.id,
        });

        // inform event entertainers
        // set mail title
        const title = `${event.owner.firstName} Cancelled ${event.eventType}`;

        event.entertainers.map((eventEntertainer) => {
          EventEntertainer.update(
            {
              hiredEntertainer: null,
              hiredDate: null,
              cancelled: true,
              cancelledDate: Date.now(),
              cancelledReason,
            },
            {
              where: {
                id: eventEntertainer.id,
              },
            }
          ).then(async () => {
            // add to cancelled
            const amount =
              eventEntertainer.applications[0].proposedPrice ||
              eventEntertainer.applications[0].askingPrice;

            await CancelEventEntertainer.create({
              userId,
              amount,
              eventEntertainerId: eventEntertainer.id,
              cancelledBy: 'User',
              cancelledDate: Date.now(),
              cancelledReason,
            });

            // add entertainer notification
            await Notification.create({
              userId: eventEntertainer.entertainer.personalDetails.id,
              title: NOTIFICATIONS.USER_CANCEL_EVENT,
              description: `${event.owner.firstName} CANCELLED ${event.eventType}`,
              type: NOTIFICATION_TYPE.DANGER,
              actionId: event.id,
            });

            sendMail(
              EMAIL_CONTENT.USER_CANCELLED_EVENT,
              {
                email: eventEntertainer.entertainer.personalDetails.email,
                firstName: eventEntertainer.entertainer.stageName,
              },
              {
                title,
                subject: title,
                contentTop: `We regret to inform you that ${event.owner.firstName} has cancelled corporate event and therefore, no longer requires your performance/entertainment services to be provided at the event with details stated below.`,
                contentBottom: `
                <strong>Event:</strong> ${event.eventType} <br>
                <strong>Place:</strong> ${eventEntertainer.placeOfEvent} <br>
                <strong>Date:</strong> ${getLongDate(event.eventDate)} <br>
                <strong>Start Time:</strong> ${getTime(event.startTime)} <br>
                <strong>Duration:</strong> ${event.eventDuration} <br>
                <strong>Reason for Cancellation:</strong><br> ${cancelledReason}
              `,
                contentFooter: `Compensation Due: 35% of Take-Home Amount (You are entitled to compensation only If cancellation is done less than 48hrs to event date)
                `,
              }
            );
          });
        });

        return res.json({ event });
      })
      .catch((error) => {
        const errorMessage = error.message || error;
        return res.status(412).json({ message: errorMessage });
      });
  },

  async getAllEvents(req, res) {
    const {
      eventTime,
      highestBudget,
      language,
      limit,
      lowestBudget,
      offset,
    } = req.query;

    try {
      let eventEntertainerQuery = {};
      const eventEntertainerStaticKeys = [
        'auctionEndDate',
        'auctionStartDate',
        'cancelled',
        'hireType',
      ];

      eventEntertainerStaticKeys.forEach((key) => {
        if (req.query[key]) {
          eventEntertainerQuery[key] = req.query[key];
        }
      });

      if (lowestBudget && parseInt(lowestBudget, 10) > 0) {
        eventEntertainerQuery.lowestBudget = { [Op.gte]: lowestBudget };
      }
      if (highestBudget && parseInt(highestBudget, 10) > 0) {
        eventEntertainerQuery.highestBudget = { [Op.lte]: highestBudget };
      }

      if (language) {
        const languages = JSON.parse(language);
        let languageQuery = languages.map((lang) => ({
          [Op.substring]: lang,
        }));

        eventEntertainerQuery.language = {
          [Op.and]: languageQuery,
        };
      }

      const staticKeys = ['cancelled', 'eventType', 'state', 'userId'];
      const dateKeys = ['cancelledDate', 'eventDate', 'startTime'];
      let eventQuery = {};
      staticKeys.forEach((key) => {
        if (req.query[key]) {
          eventQuery[key] = req.query[key];
        }
      });
      dateKeys.forEach((key) => {
        if (req.query[key]) {
          eventQuery[key] = { [Op.eq]: req.query[key] };
        }
      });
      if (eventTime && eventTime === EVENTDATE_FILTER.PAST) {
        eventQuery.eventDate = { [Op.lte]: Sequelize.literal('NOW()') };
      }
      if (eventTime && eventTime === EVENTDATE_FILTER.FUTURE) {
        eventQuery.eventDate = { [Op.gte]: Sequelize.literal('NOW()') };
      }

      const applicationKeys = ['applicationType', 'paid', 'status'];
      let applicationQuery = {};
      applicationKeys.forEach((key) => {
        if (req.query[key]) {
          applicationQuery[key] = req.query[key];
        }
      });

      const eventInclude = [
        {
          model: EventEntertainer,
          as: 'entertainers',
          where: eventEntertainerQuery,
          include: [
            {
              model: EntertainerProfile,
              as: 'entertainer',
              attributes: [
                'id',
                'stageName',
                'entertainerType',
                'location',
                'about',
              ],
              include: [
                {
                  model: User,
                  as: 'personalDetails',
                  attributes: [
                    'id',
                    'firstName',
                    'lastName',
                    'profileImageURL',
                  ],
                },
              ],
            },
            {
              model: Application,
              as: 'applications',
              // where: applicationQuery,
            },
          ],
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'firstName', 'lastName', 'profileImageURL'],
        },
      ];

      const options = {
        offset: offset || 0,
        limit: limit || 10,
        where: eventQuery,
        include: eventInclude,
      };

      try {
        const { result, pagination } = await getAll(Event, options);
        return res.status(200).json({ events: result, pagination });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    } catch (error) {
      const status = error.status || 500;
      const errorMessage = error.message || error;
      return res.status(status).json({ message: errorMessage });
    }
  },
  // update event details
  // inform entertainer
  // add to admin (how do I process)
  // refund entertainer
  // refund user
};

export default EventController;
