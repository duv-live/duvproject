export const USER_TYPES = {
  ADMINISTRATOR: 0,
  USER: 1,
  ENTERTAINER: 2,
  BAND_MEMBER: 3,
  UNKNOWN: 999,
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

export const NOTIFICATIONS = {
  ACCOUNT_CREATED: 'ACCOUNT CREATED',
  BID_APPROVED: 'BID APPROVED',
  NEW_AWARD: 'NEW AWARD',
  PASSWORD_CHANGED: 'PASSWORD CHANGED',
  PAYMENT_INITIATED: 'PAYMENT INITIATED',
  PAYMENT_SUCCESSFUL: 'PAYMENT SUCCESSFUL',
  PAYMENT_RECEIVED: 'PAYMENT RECEIVED',
  REQUEST_ACCEPTED: 'REQUEST ACCEPTED',
  REQUEST_REJECTED: 'REQUEST REJECTED',
  REQUEST_INCREMENT: 'REQUEST INCREMENT',
};

export const NOTIFICATION_TYPE = {
  DANGER: 0, // RED
  CONTENT: 1, //AMBER
  INFO: 2, //  BLUE
  SUCCESS: 3, // GREEN
};

export const REQUEST_ACTION = {
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  INCREMENT: 'Increment',
};
