export const ENTERTAINER_DISCOUNT = 0.35;

export const MEDIA_TYPES = {
  Approved: true,
  Pending: null,
  Rejected: false,
};

export const USER_TYPES = {
  ADMINISTRATOR: 0,
  USER: 1,
  ENTERTAINER: 2,
  BAND_MEMBER: 3,
  UNKNOWN: 999, // uncompleted social media signup
  ALL: 1000, // useful for global notifications only
};

export const TRANSACTION_STATUSES = {
  FAILED: 'failed',
  SUCCESS: 'success',
  ABANDONED: 'abandoned',
};

export const RATINGS = {
  UPPER_BOUND: 5,
  LOWER_BOUND: 1,
};

export const ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',
  BANNED: 'BANNED',
  DEACTIVATED: 'DEACTIVATED',
};

export const NOTIFICATIONS = {
  ACCOUNT_CREATED: 'ACCOUNT CREATED',
  ACCOUNT_UPDATED: 'ACCOUNT UPDATED',
  BID_APPROVED: 'BID APPROVED',
  NEW_AWARD: 'NEW AWARD',
  PAID_REQUEST: 'PAID REQUEST',
  PASSWORD_CHANGED: 'PASSWORD CHANGED',
  PAYMENT_INITIATED: 'PAYMENT INITIATED',
  PAYMENT_SUCCESSFUL: 'PAYMENT SUCCESSFUL',
  PAYMENT_RECEIVED: 'PAYMENT RECEIVED',
  REQUEST_ACCEPTED: 'REQUEST ACCEPTED',
  REQUEST_REJECTED: 'REQUEST REJECTED',
  REQUEST_INCREMENT: 'REQUEST INCREMENT',
  USER_CANCEL_EVENT: 'CANCELLED EVENT',
  ENTERTAINER_NOT_AVAILABLE: 'NOT AVAILABLE FOR EVENT',
  USER_REMOVE_ENTERTAINER: 'USER REMOVE ENTERTAINER',
  BAND_MEMBER_ADDITION: 'BAND MEMBER ADDITION',
};

export const NOTIFICATION_TYPE = {
  DANGER: 0, // RED
  CONTENT: 1, //AMBER
  INFO: 2, //  BLUE
  SUCCESS: 3, // GREEN
};

export const REQUEST_ACTION = {
  APPROVED: 'Approved',
  CANCELLED: 'Cancelled',
  EMPTY: null,
  PAID: 'Paid',
  PENDING: 'Pending',
  REJECTED: 'Rejected',
  INCREMENT: 'Increment',
};

export const ENTERTAINER_APPROVAL = {
  APPROVED: true,
  DISAPPROVED: false,
};

export const EVENT_HIRETYPE = {
  SEARCH: 'Search',
  AUCTION: 'Auction',
  RECOMMENDATION: 'Recommendation',
  EMPTY: null,
};

export const EVENTDATE_FILTER = {
  FUTURE: 'future',
  PAST: 'past',
};
