import React from 'react';
import { ENTERTAINER_TYPE, REQUEST_ACTION } from './constants';
import Humanize from 'humanize-plus';

/**
 * Carousel Chunk
 * @param {*} array
 * @param {*} size
 */
export const chunk = (array, size) => {
  const chunked_arr = [];
  let index = 0;
  while (index < array.length) {
    chunked_arr.push(array.slice(index, size + index));
    index += size;
  }
  return chunked_arr;
};

export const commaNumber = (value, prependCurrency = false) => {
  const number = parseInt(value, 10);
  const currency = prependCurrency ? '₦' : '';
  return currency + Humanize.intComma(number);
};

export const moneyFormat = (value) => Humanize.formatNumber(value, 2);
export const moneyFormatInNaira = (value) => commaNumber(value, true);

export const getBudgetRange = (minBudget, maxBudget) => {
  const MAX_BUDGET_OUTPUT = 1000000;
  const suffix = maxBudget > MAX_BUDGET_OUTPUT ? '+' : '';
  const range = `₦${commaNumber(minBudget)} - ₦${commaNumber(
    Humanize.boundedNumber(maxBudget, MAX_BUDGET_OUTPUT)
  )}`;
  return range + suffix;
};

export const twoDigitNumber = (number) =>
  number > 0 && number < 10 ? '0' + number : number;

export const listJsonItems = (items, defaultValue = null) => {
  try {
    const parsedItems = JSON.parse(items);
    if (!parsedItems) return defaultValue;
    if (parsedItems.length <= 1) return parsedItems;
    return parsedItems.join(', ');
  } catch (error) {
    console.log('error', error);
    return defaultValue;
  }
};

/**
 * Item Selection
 * @param {*} items
 */
export const randomItem = (items) =>
  items[Math.floor(Math.random() * items.length)];

export const getItems = (items, end) => {
  if (items == null) return items;
  // The slice() method returns a shallow copy of a portion of an array into a new array object selected from begin to end (end not included). The original array will not be modified.
  return items.slice(0, end);
};

export const shuffleItems = (items) => {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};

/**
 * Slugs
 * @param {*} items
 * @param {*} slug
 */

export const getSlug = (items, slug) =>
  items.filter((item) => item.slug === slug)[0];

export const getOtherSlugs = (items, slug) =>
  items.filter((item) => item.slug !== slug);

export const getRelatedEntertainers = (items, slug, type) =>
  items.filter((item) => item.slug !== slug && item.type === type);

export const range = (start, stop, step = 1) => {
  const len = Math.floor((stop - start) / step) + 1;
  return Array(len)
    .fill()
    .map((_, idx) => start + idx * step);
};
/**
 * Create HTML Markup
 * @param {*} text
 */
export const createMarkup = (text) => ({ __html: text });

export const dashedLowerCase = (text) =>
  text && text.toString().replace(/\s+/g, '-').toLowerCase();

export const selectEntertainerType = () => {
  const select = [];
  for (const property in ENTERTAINER_TYPE) {
    select.push({ value: property, label: ENTERTAINER_TYPE[property] });
  }
  return select;
};

export const getProfileName = ({ firstName, lastName, stageName }) =>
  stageName || firstName + ' ' + lastName;

export const countOccurences = (arr) => {
  const items = arr.reduce((acc, val) => {
    acc[val] = acc[val] === undefined ? 1 : (acc[val] += 1);
    return acc;
  }, {});
  return Object.keys(items).map(
    (name) => items[name] + ' ' + Humanize.pluralize(items[name], name)
  );
};

export const getPercentage = (value) => parseFloat(value) / 100;
export const getNairaSymbol = () => <>&#8358;</>;

export const isDevEnvironment = () =>
  !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

export const getProxy = () =>
  isDevEnvironment() ? 'http://localhost:8080' : '';

export const getRequestStatusIcon = (status) => {
  switch (status) {
    case REQUEST_ACTION.APPROVED:
      return (
        <div className="text-green">
          <span className="icon icon-ok-circled"></span>
          {status}
        </div>
      );

    case REQUEST_ACTION.INCREMENT:
      return (
        <div className="text-white">
          <span className="icon icon icon-up-big"></span>
          {status}
        </div>
      );

    case REQUEST_ACTION.REJECTED:
      return (
        <div className="text-danger">
          <span className="icon icon icon-cancel-circled"></span>
          {status}
        </div>
      );

    default:
      return (
        <div className="text-yellow">
          <span className=" text-pending icon icon icon-hourglass"></span>
          {status}
        </div>
      );
  }
};
