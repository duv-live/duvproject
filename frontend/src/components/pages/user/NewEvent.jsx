import React from 'react';
import PropTypes from 'prop-types';
import Humanize from 'humanize-plus';
import TopMessage from 'components/common/TopMessage';
import EventDetails from 'components/common/EventDetails';
import EventAddress from 'components/common/EventAddress';
import AddEntertainer from 'components/common/AddEntertainer';
import { HIRE_ENTERTAINERS } from 'utils/constants';
import { navigate } from '@reach/router';
import BackEndPage from 'components/common/BackEndPage';

const NewEvent = ({ hire_type }) => {
  const validHireType = Object.keys(HIRE_ENTERTAINERS).includes(
    hire_type.toLowerCase()
  );
  const currentHireType = Humanize.capitalize(hire_type);
  const message = validHireType
    ? `Hire an Entertainer (${currentHireType})`
    : 'Enter a New Event';
  const btnText = validHireType ? `Start ${currentHireType}` : 'Save Event';
  const onSubmit = () => {
    const urlToRedirect = validHireType
      ? '/user/events'
      : '/user/hire-entertainer/1';
    return navigate(urlToRedirect);
  };
  return (
    <BackEndPage title="New Events">
      <div className="main-app">
        <TopMessage message={message} />

        <section className="app-content">
          <EventDetails />
          <EventAddress />
          {validHireType && <AddEntertainer />}
          <div className="mt-5">
            <button
              className="btn btn-transparent btn-primary text-right btn-lg"
              onClick={onSubmit}
              type="submit"
            >
              {btnText}
            </button>
          </div>
        </section>
      </div>
    </BackEndPage>
  );
};

NewEvent.propTypes = {
  hire_type: PropTypes.string
};

NewEvent.defaultProps = {
  hire_type: ''
};

export default NewEvent;
