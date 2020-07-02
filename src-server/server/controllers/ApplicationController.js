import { Sequelize, Op } from 'sequelize';
import {
  Application,
  Event,
  EventEntertainer,
  User,
  EntertainerProfile,
  Commission,
  Notification,
  Payment,
} from '../models';
import sendMail from '../MailSender';
import { validString, moneyFormat, getLongDate, getTime } from '../utils';
import {
  APPLICATION_TYPE,
  NOTIFICATIONS,
  NOTIFICATION_TYPE,
  REQUEST_ACTION,
  USER_TYPES,
} from '../constant';
import EMAIL_CONTENT from '../email-template/content';
import { addDays } from 'date-fns';
import { DEFAULT_COMMISSION } from './CommissionController';
import { priceCalculatorHelper } from '../utils/priceCalculator';

const ApplicationController = {
  /**
   * create Application
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  entertainerApplication(req, res) {
    const { status, askingPrice, eventId, eventEntertainerId, id } = req.body;

    const error = {
      ...validString(status),
      ...validString(askingPrice),
    };
    if (Object.keys(error).length > 1) {
      return res.status(400).json({ message: error.message.join('') });
    }
    let newApplication = {};
    if (!id) {
      return Application.create({
        status,
        askingPrice,
        eventId,
        eventEntertainerId,
        userId: req.user.id,
      })
        .then((application) => {
          newApplication = application;
          return req.user.addApplication(application);
        })
        .then(() => {
          return res.status(200).json({
            message: 'Application created successfully',
            application: newApplication,
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
      .getApplications({ where: { id } })
      .then((applications) => {
        if (applications && applications.length > 0) {
          if (req.user.type === USER_TYPES.ADMINISTRATOR) {
            return applications[0].update({
              status,
            });
          }
          return applications[0].update({
            askingPrice,
          });
        }
        throw `No Application with id ${id}`;
      })
      .then((event) => {
        return res.status(200).json({
          message: 'Application updated successfully',
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
   * get Application
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getEntertainerApplications(req, res) {
    req.user.getEvents().then((applications) => {
      if (!applications || applications.length === 0) {
        return res.status(404).json({ message: 'Application not found' });
      }
      return res.status(200).json({ applications });
    });
  },

  /**
   * get Dashboard Bids and Requests(for user)
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getApplicationsForUserDashboard(req, res) {
    EventEntertainer.findAll({
      where: {
        userId: req.user.id,
        hiredEntertainer: null, // shown for events with no hired Entertainer
      },
      order: [
        [{ model: Application, as: 'applications' }, 'createdAt', 'DESC'],
      ],
      attributes: ['id'],
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'eventType', 'eventDate'],
          where: {
            eventDate: { [Op.gte]: addDays(Date.now(), 3) },
          },
        },
        {
          model: Application,
          as: 'applications',
          attributes: [
            'id',
            'status',
            'askingPrice',
            'applicationType',
            'proposedPrice',
            'createdAt',
          ],
          required: true,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'profileImageURL'],
              include: [
                {
                  model: EntertainerProfile,
                  as: 'profile',
                  attributes: [
                    'id',
                    'stageName',
                    'entertainerType',
                    'slug',
                    'location',
                  ],
                },
              ],
            },
          ],
        },
      ],
    }).then((eventEntertainers) => {
      const results = eventEntertainers.reduce(
        (result, eventEntertainer) => {
          const eventDetails = {
            eventEntertainerId: eventEntertainer.id,
            eventId: eventEntertainer.event.id,
            eventType: eventEntertainer.event.eventType,
            eventDate: eventEntertainer.event.eventDate,
          };

          eventEntertainer.applications.map((application) => {
            const applicationDetails = {
              applicationId: application.id,
              status: application.status,
              type: application.applicationType,
              askingPrice: application.askingPrice,
              createdAt: getLongDate(application.createdAt),
              proposedPrice: application.proposedPrice,
              userId: application.user.id,
              profileImageURL: application.user.profileImageURL,
              entertainerId: application.user.profile.id,
              stageName: application.user.profile.stageName,
              entertainerType: application.user.profile.entertainerType,
              location: application.user.profile.location,
              slug: application.user.profile.slug,
            };
            if (applicationDetails.type === APPLICATION_TYPE.BID) {
              result.bids.push({ ...eventDetails, ...applicationDetails });
            } else {
              result.requests.push({ ...eventDetails, ...applicationDetails });
            }
          });
          return result;
        },
        { requests: [], bids: [] }
      );

      return res.status(200).json({ results });
    });
  },

  /**
   * get Dashboard Auctions, Requests, upcoming Events, pending payments (for entertainers)
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getDashboardDetailsForEntertainer(req, res) {
    EventEntertainer.findAll({
      where: {
        [Op.or]: [
          {
            // Auctions
            hireType: 'Auction',
            auctionStartDate: { [Op.lte]: Sequelize.literal('NOW()') },
            auctionEndDate: { [Op.gte]: Sequelize.literal('NOW()') },
            entertainerType: {
              [Op.eq]: req.user.profile.entertainerType,
            },
            [Op.and]: Sequelize.literal('applications.id is null'),
          },
          {
            // Upcoming Events
            hiredEntertainer: req.user.profile.id,
            [Op.and]: Sequelize.literal('"event"."eventDate" > NOW()'),
          },
          {
            // Requests
            [Op.and]: [
              {
                [Op.and]: Sequelize.literal(
                  `"applications"."userId" = ${req.user.id}`
                ),
              },
              {
                [Op.and]: Sequelize.literal(
                  `"applications"."status" = ${REQUEST_ACTION.PENDING}`
                ),
              },
              {
                [Op.and]: Sequelize.literal(
                  `"applications"."applicationType" = 'Request'`
                ),
              },
              {
                [Op.and]: Sequelize.literal(
                  `"applications"."expiryDate" > NOW()`
                ),
              },
            ],
          },
          {
            // Bids
            [Op.and]: [
              {
                [Op.and]: Sequelize.literal(
                  `"applications"."userId" = ${req.user.id}`
                ),
              },
              {
                [Op.and]: Sequelize.literal(
                  `"applications"."status" = ${REQUEST_ACTION.PENDING}`
                ),
              },
              {
                [Op.and]: Sequelize.literal(
                  `"applications"."applicationType" = ${APPLICATION_TYPE.BID}`
                ),
              },
            ],
          },
        ],
      },
      // attributes: ['id'],
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
          where: {
            eventDate: { [Op.gte]: addDays(Date.now(), 3) },
          },
        },
        {
          model: Application,
          as: 'applications',
        },
      ],
    }).then(async (eventEntertainers) => {
      const pendingPayments = await EventEntertainer.findAll({
        attributes: ['id', 'hireType'],
        where: {
          hiredEntertainer: req.user.profile.id,
          [Op.and]: Sequelize.literal('"eventPayment"."id" is null'),
        },
        include: [
          {
            model: Event,
            as: 'event',
            attributes: ['id', 'eventType', 'eventDate'],
            where: {
              eventDate: {
                [Op.lt]: Date.now(),
              },
            },
          },
          {
            model: Payment,
            as: 'eventPayment',
          },
          {
            model: Application,
            as: 'applications',
            attributes: [
              'id',
              'commissionId',
              'askingPrice',
              'applicationType',
              'proposedPrice',
              'createdAt',
            ],
            include: [
              {
                model: Commission,
                as: 'commission',
              },
            ],
          },
        ],
      });
      const results = eventEntertainers.reduce(
        (result, eventEntertainer) => {
          if (
            eventEntertainer.applications &&
            eventEntertainer.applications.length > 0 &&
            eventEntertainer.applications[0].applicationType ===
              APPLICATION_TYPE.BID
          ) {
            result.bids.push(eventEntertainer);
          } else if (eventEntertainer.hireType === 'Auction') {
            result.auctions.push(eventEntertainer);
          } else if (eventEntertainer.hiredEntertainer) {
            result.upcomingEvents.push({
              ...eventEntertainer.event.toJSON(),
              eventEntertainerId: eventEntertainer.id,
            });
          } else {
            result.requests.push(eventEntertainer);
          }
          return result;
        },
        { auctions: [], bids: [], requests: [], upcomingEvents: [] }
      );

      return res.status(200).json({ results: { ...results, pendingPayments } });
    });
  },
  /**
   * get Dashboard Payments, upcoming Events, Band Members
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getDashboardDetailsForBandMember(req, res) {
    const entertainerId = req.user.profile.id;

    EventEntertainer.findAll({
      where: {
        [Op.or]: [
          {
            // Upcoming Events
            hiredEntertainer: entertainerId,
            [Op.and]: Sequelize.literal('"event"."eventDate" > NOW()'),
          },
        ],
      },
      // attributes: ['id'],
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
          where: {
            eventDate: { [Op.gte]: addDays(Date.now(), 3) },
          },
        },
        {
          model: Application,
          as: 'applications',
        },
      ],
    }).then(async (upcomingEvents) => {
      const pendingPayments = await EventEntertainer.findAll({
        attributes: ['id', 'hireType'],
        where: {
          hiredEntertainer: req.user.profile.id,
          [Op.and]: Sequelize.literal('"eventPayment"."id" is null'),
        },
        include: [
          {
            model: Event,
            as: 'event',
            attributes: ['id', 'eventType', 'eventDate'],
            where: {
              eventDate: {
                [Op.lt]: Date.now(),
              },
            },
          },
          {
            model: Payment,
            as: 'eventPayment',
          },
          {
            model: Application,
            as: 'applications',
            attributes: [
              'id',
              'commissionId',
              'askingPrice',
              'applicationType',
              'proposedPrice',
              'createdAt',
            ],
            include: [
              {
                model: Commission,
                as: 'commission',
              },
            ],
          },
        ],
      });
      const bandMembers = await User.findAll({
        where: {
          userId: req.user.id,
          isActive: true,
        },
      });
      const allPayments = await Payment.findAll({
        where: {
          entertainerId,
        },
      });

      return res.status(200).json({
        results: {
          upcomingEvents,
          pendingPayments,
          bandMembers: bandMembers.length,
          allPayments: allPayments.length,
        },
      });
    });
  },

  /**
   * get Entertainers Bids
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getEntertainerBids(req, res) {
    return req.user
      .getApplications({
        where: {
          applicationType: APPLICATION_TYPE.BID,
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
            model: EventEntertainer,
            as: 'eventEntertainerInfo',
          },
        ],
      })
      .then((bids) => {
        if (!bids || bids.length === 0) {
          return res.status(404).json({ message: 'Event not found' });
        }
        return res.status(200).json({ bids });
      });
  },

  /**
   * get Entertainers Request
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  getEntertainerRequest(req, res) {
    return req.user
      .getApplications({
        where: {
          applicationType: APPLICATION_TYPE.REQUEST,
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
            model: EventEntertainer,
            as: 'eventEntertainerInfo',
          },
        ],
      })
      .then((requests) => {
        if (!requests || requests.length === 0) {
          return res.status(404).json({ message: 'Event not found' });
        }
        return res.status(200).json({ requests });
      });
  },

  /**
   * process Entertainer response to User Request
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  processRequestApplication(req, res) {
    const userId = req.user.id;
    const applicationId = req.params.applicationId;
    const action = req.body.action;
    const proposedPrice = req.body.proposedPrice;
    const rejectionReason = req.body.rejectionReason;

    if (!applicationId || !action) {
      return res.status(404).json({
        message: 'Application Id and Action needed to process application',
      });
    }

    if (!Object.keys(REQUEST_ACTION).includes(action.toUpperCase())) {
      return res.status(400).json({
        message: `${action} is not a valid action. Action should be one of Approved, Rejected or Increment`,
      });
    }

    if (action === REQUEST_ACTION.INCREASE && !proposedPrice) {
      return res.status(400).json({
        message: 'Proposed Price is needed in you are asking for an increment',
      });
    }

    Application.findOne({
      where: { id: applicationId, userId },
      include: [
        {
          model: EventEntertainer,
          as: 'eventEntertainerInfo',
          include: {
            model: Event,
            as: 'event',
            include: [
              {
                model: User,
                as: 'owner',
                attributes: ['id', 'firstName', 'lastName', 'email'],
              },
            ],
          },
        },
        {
          model: User,
          as: 'user',
          attributes: ['email'],
          include: [
            {
              model: EntertainerProfile,
              as: 'profile',
              attributes: ['id', 'stageName'],
            },
          ],
        },
      ],
    })
      .then((application) => {
        const currentDate = Date.now();

        // for email
        const EMAIL_PARAMS = {
          askingPrice: moneyFormat(application.askingPrice),
          proposedPrice: REQUEST_ACTION.REQUEST_INCREMENT
            ? moneyFormat(parseInt(proposedPrice, 10))
            : 0,
          userName: application.eventEntertainerInfo.event.owner.firstName,
          userEmail: application.eventEntertainerInfo.event.owner.email,
          entertainerName: application.user.profile.stageName,
          eventType: application.eventEntertainerInfo.event.eventType,
          eventDate: getLongDate(
            application.eventEntertainerInfo.event.eventDate
          ),
          startTime: getTime(application.eventEntertainerInfo.event.startTime),
          eventPlace: application.eventEntertainerInfo.placeOfEvent,
          eventDuration: application.eventEntertainerInfo.event.eventDuration,
        };

        if (!application) {
          return res.status(404).json({ message: 'Application not found' });
        }
        // application has previously been approved
        if (application.status !== 'Pending') {
          return res.status(401).json({
            message: 'This application has already been processed',
          });
        }

        // application is only valid if it has no hiredEntertainer
        if (application.eventEntertainerInfo.hiredEntertainer) {
          return res.status(400).json({
            message:
              'Application is no longer valid. An entertainer has been selected for event',
          });
        }

        let updateConditions;
        let notificationCondition;
        let description;
        let contentTop;

        switch (action) {
          /*
           * user can accept, reject, ask for increment
           * accept - status = approved,approvedDate => now
           * reject - status => rejected, rejectionReason, rejectionDate = now
           * increment - proposedPrice, rejectionReason, rejection Date = now
           */

          case REQUEST_ACTION.APPROVED:
            updateConditions = {
              status: REQUEST_ACTION.APPROVED,
              approvedDate: currentDate,
            };
            contentTop =
              'We are happy to inform you that World Best has accepted your request to perform/provide entertainment services at the event with details stated below.';
            description = ` YIPEE!!! ${EMAIL_PARAMS.entertainerName} ACCEPTED Your Request`;
            notificationCondition = {
              title: NOTIFICATIONS.REQUEST_ACCEPTED,
              type: NOTIFICATION_TYPE.SUCCESS,
            };
            break;

          case REQUEST_ACTION.INCREMENT:
            updateConditions = {
              status: REQUEST_ACTION.INCREMENT,
              approvedDate: currentDate,
              proposedPrice,
            };
            contentTop =
              'This is to inform you that Tantelke has responded to your request to perform/provide entertainment services at the event with details stated below.';
            description = `${EMAIL_PARAMS.entertainerName} Wants An Increment For ${EMAIL_PARAMS.eventType}`;
            notificationCondition = {
              title: NOTIFICATIONS.REQUEST_INCREMENT,
              type: NOTIFICATION_TYPE.INFO,
            };
            break;

          case REQUEST_ACTION.REJECTED:
            updateConditions = {
              status: REQUEST_ACTION.REJECTED,
              rejectionReason,
              rejectionDate: currentDate,
            };
            contentTop =
              'We regret to inform you that World Best declined your request to perform/provide entertainment services at the event with details stated below.';
            description = `${EMAIL_PARAMS.entertainerName} Declined Your Request For ${EMAIL_PARAMS.eventType}`;
            notificationCondition = {
              title: NOTIFICATIONS.REQUEST_REJECTED,
              type: NOTIFICATION_TYPE.DANGER,
            };
            break;

          default:
            break;
        }

        // updated approved application
        return Application.update(updateConditions, {
          where: {
            id: applicationId,
            userId,
          },
        }).then(async () => {
          // notification
          await Notification.create({
            ...notificationCondition,
            actionId: applicationId, //application id
            description,
            userId: application.eventEntertainerInfo.event.owner.id,
          });

          // send mail to user
          await sendEntertainerResponseToRequestMail({
            ...EMAIL_PARAMS,
            ...updateConditions,
            description,
            contentTop,
            applicationId,
          });

          // response
          return res.json({
            application: { ...application.toJSON(), ...updateConditions },
            message: 'Your response has been recorded. Thank you.',
          });
        });
      })
      .catch((error) => {
        const errorMessage = error.message || error;
        return res.status(412).json({ message: errorMessage });
      });
  },

  /**
   * Get application for valid entertainer only
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */

  getOneApplication(req, res) {
    const id = req.params.id;
    const userId = req.user.id;

    if (!id) {
      return res.status(404).json({
        message: 'Application Id needed to view application',
      });
    }

    Application.findOne({
      where: {
        id,
        [Op.or]: {
          userId,
          [Op.and]: Sequelize.literal(
            `"eventEntertainerInfo"."userId" = ${userId}`
          ),
        },
      },
      include: [
        {
          model: EventEntertainer,
          as: 'eventEntertainerInfo',
          include: {
            model: Event,
            as: 'event',
            include: [
              {
                model: User,
                as: 'owner',
                attributes: ['id', 'firstName', 'lastName'],
              },
            ],
          },
        },
        {
          model: Commission,
          as: 'commission',
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'profileImageURL'],
          include: [
            {
              model: EntertainerProfile,
              as: 'profile',
            },
          ],
        },
      ],
    })
      .then((application) => {
        if (!application) {
          return res.status(404).json({ message: 'Application not found' });
        }
        return res.json({ application });
      })
      .catch((error) => {
        const errorMessage = error.message || error;
        return res.status(412).json({ message: errorMessage });
      });
  },

  /**
   * Approve Application
   * @function
   * @param {object} req is req object
   * @param {object} res is res object
   * @return {object} returns res object
   */
  approveApplication(req, res) {
    // const currentDate = Date.now();
    const id = req.params.applicationId;

    if (!id) {
      return res.status(404).json({
        message: 'Application Id needed to approve application',
      });
    }

    Application.findOne({
      where: { id },
      include: [
        {
          model: EventEntertainer,
          as: 'eventEntertainerInfo',
          include: {
            model: Event,
            as: 'event',
          },
        },
        {
          model: User,
          as: 'user',
          attributes: ['email'],
          include: [
            {
              model: EntertainerProfile,
              as: 'profile',
              attributes: ['id', 'stageName'],
            },
          ],
        },
        {
          model: Commission,
          as: 'commission',
        },
      ],
    })
      .then((application) => {
        const isARequest = application.applicationType !== APPLICATION_TYPE.BID;

        const commission = application.commission || DEFAULT_COMMISSION;
        const { entertainerFee } = priceCalculatorHelper(
          application.askingPrice,
          commission,
          application.eventEntertainerInfo.hireType
        );
        const currentDate = Date.now();
        const eventEntertainerId = application.eventEntertainerId;
        // for email
        const EMAIL_PARAMS = {
          askingPrice: moneyFormat(application.askingPrice),
          entertainerName: application.user.profile.stageName,
          entertainerEmail: application.user.email,
          eventType: application.eventEntertainerInfo.event.eventType,
          eventPlace: application.eventEntertainerInfo.placeOfEvent,
          eventDate: getLongDate(
            application.eventEntertainerInfo.event.eventDate
          ),
          eventStart: getTime(application.eventEntertainerInfo.event.startTime),
          eventDuration: application.eventEntertainerInfo.event.eventDuration,
          id: application.id,
          takeHome: moneyFormat(entertainerFee),
        };

        if (!application) {
          return res.status(404).json({ message: 'Application not found' });
        }

        // application has previously been approved
        if (application.status === 'Paid') {
          return res.status(200).json({
            application,
            message: 'This application has already been marked as paid',
          });
        }

        // updated approved application
        return Application.update(
          {
            takeHome: entertainerFee,
            status: 'Paid',
            approvedDate: currentDate,
            paid: true,
            paidOn: Date.now(),
          },
          {
            where: {
              id,
            },
          }
        ).then(() => {
          // add approved entertainer to evententertainer
          EventEntertainer.update(
            {
              hiredEntertainer: application.user.profile.id,
              hiredDate: currentDate,
            },
            {
              where: {
                id: eventEntertainerId,
              },
            }
          ).then(() =>
            Application.update(
              // reject other bids
              {
                status: 'Rejected',
                rejectionDate: currentDate,
                rejectionReason: 'Application not selected',
              },
              {
                where: {
                  id: { [Op.ne]: id },
                  eventEntertainerId: application.eventEntertainerInfo.id,
                },
              }
            ).then(async () => {
              // if it is an auction
              // Send Email to approved entertainer
              if (isARequest) {
                sendPaidRequestMail(EMAIL_PARAMS);
                await Notification.create({
                  userId: application.user.profile.id,
                  title: NOTIFICATIONS.PAID_REQUEST,
                  description: `Your request for ${EMAIL_PARAMS.eventType} has been approved`,
                  type: NOTIFICATION_TYPE.SUCCESS,
                  actionId: id, //application id
                });
              } else {
                sendApprovedBidMail(EMAIL_PARAMS);
                await Notification.create({
                  userId: application.user.profile.id,
                  title: NOTIFICATIONS.BID_APPROVED,
                  description: `Your bid for ${EMAIL_PARAMS.eventType} has been approved`,
                  type: NOTIFICATION_TYPE.SUCCESS,
                  actionId: id, //application id
                });
              }

              await Notification.create({
                userId: application.eventEntertainerInfo.event.userId,
                title: NOTIFICATIONS.PAYMENT_SUCCESSFUL,
                description: `Your initiated payment was successful.`,
                type: NOTIFICATION_TYPE.SUCCESS,
                actionId: id, //application id
              });
              return res.json({
                application,
                message:
                  'Entertainer Application has been successfully approved',
              });
            })
          );
        });
      })
      .catch((error) => {
        const errorMessage = error.message || error;
        return res.status(412).json({ message: errorMessage });
      });
  },
};

const sendApprovedBidMail = (params) => {
  // Build Email
  const contentTop =
    'We are pleased to inform you that your bid for performance at an event with details below has been selected and approved by the event host.';
  const contentBottom = `
    <strong>Event:</strong> ${params.eventType} <br>
    <strong>Place:</strong> ${params.eventPlace} <br>
    <strong>Date:</strong> ${params.eventDate} <br>
    <strong>Start Time:</strong> ${params.eventStart} <br>
    <strong>Duration:</strong> ${params.eventDuration} <br>
    <strong>Take Home Pay:</strong> NGN ${params.takeHome}
  `;

  const contentFooter = `
  <small>
  Note: By not clicking decline, you are accepting to perform, and hereby undertake to: <br />
  <ol type="a">
   <li>Perform at the above event after which your bank account will be credited with the above stated take-home amount.</li>
   <li>Inform the event host and DUV LIVE of any cancellation at least 48hrs before the event date. Failure to do so (except due to reasons considered under Force Majeure) shall result in the removal of the entertainer's account, the blacklisting of the User's Personal Details on the DUV LIVE online platform, and any other legal action deemed reasonably necessary by the affected persons.</li>
   </ol>
   </small>
   `;
  sendMail(
    EMAIL_CONTENT.APPROVED_BID,
    { email: params.entertainerEmail, firstName: params.entertainerName },
    {
      link: `${process.env.HOST}/entertainer/bid/view/${params.id}`,
      contentTop,
      contentBottom,
      contentFooter,
    }
  );
};

const sendPaidRequestMail = (params) => {
  // Build Email
  const contentTop =
    'We are pleased to inform you that your fee for performance at the event with details below has been fully paid for by the event host.';
  const contentBottom = `
    <strong>Event:</strong> ${params.eventType} <br>
    <strong>Place:</strong> ${params.eventPlace} <br>
    <strong>Date:</strong> ${params.eventDate} <br>
    <strong>Start Time:</strong> ${params.eventStart} <br>
    <strong>Duration:</strong> ${params.eventDuration} <br>
    <strong>Take Home Pay:</strong> NGN ${params.takeHome}<br><br>
    For More Details on the Upcoming Event, Click the link below
  `;

  const contentFooter = `We do hope you enjoy your performance while delivering an exciting and positively unforgettable memory for your audience.`;
  sendMail(
    EMAIL_CONTENT.PAID_REQUEST,
    { email: params.entertainerEmail, firstName: params.entertainerName },
    {
      link: `${process.env.HOST}/entertainer/request/view/${params.id}`,
      contentTop,
      contentBottom,
      contentFooter,
    }
  );
};

const sendEntertainerResponseToRequestMail = (params) => {
  let buttonText;
  let link;
  // Build Email
  let contentTop = `We are pleased to inform you are requested to perform at an event with the details stated below by an event host.
  `;
  let contentBottom = `
  <strong>Event:</strong> ${params.eventType} <br>
  <strong>Place:</strong> ${params.eventPlace} <br>
  <strong>Date:</strong> ${params.eventDate} <br>
  <strong>Start Time:</strong> ${params.startTime} <br>
  <strong>Duration:</strong> ${params.eventDuration} <br>
  `;

  switch (params.status) {
    case REQUEST_ACTION.APPROVED:
      contentBottom += `<strong>Offer Amount:</strong> ${params.askingPrice} <br><br>`;
      contentBottom +=
        'To make payment, kindly proceed by clicking the link stated below.';
      link = `${process.env.HOST}/user/request/view/${params.applicationId}`;
      buttonText = 'Pay Now';
      break;

    case REQUEST_ACTION.INCREMENT:
      contentTop = `This is to inform you that ${params.entertainerName} has responded to your request to perform/ provide entertainment services at the event with details stated below.`;
      contentBottom += `<strong>Your Offer Amount:</strong> NGN ${params.askingPrice} <br><br>`;
      contentBottom += `<strong>${params.entertainerName} Amount:</strong> NGN ${params.proposedPrice} <br>`;
      link = `${process.env.HOST}/user/request/view/${params.applicationId}`;
      buttonText = 'Respond';
      break;

    case REQUEST_ACTION.REJECTED:
      contentTop = `We regret to inform you that ${params.entertainerName} declined your request to perform/provide entertainment services at the event with details stated below.`;
      contentBottom += `<strong>Offer Amount:</strong> ${params.askingPrice} <br><br>`;
      if (params.rejectionReason) {
        contentBottom += `<strong>Rejection Reason:</strong><br> ${params.rejectionReason} <br><br>`;
      }
      contentBottom +=
        'No worries. You can try hiring other entertainers by heading to your dashboard.';
      link = `${process.env.HOST}/user/dashboard`; // link to hire entetainer
      buttonText = 'Proceed To Dashboard';
      break;

    default:
      break;
  }

  sendMail(
    {
      subject: params.description,
      title: params.description,
      buttonText,
      link,
      contentTop,
      contentBottom,
    },
    { email: params.userEmail, firstName: params.userName }
  );
};

export default ApplicationController;
