import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import { Col, Card, CardImg, CardImgOverlay } from 'reactstrap';
import defaultImage from 'assets/img/events/public-event.jpg';
import { getPublicEventDate } from 'utils/date-helpers';

const Events = ({ mainImage, location, slug, startTime, endTime, title }) => {
  return (
    <Col sm={4}>
      <Link to={`/event/${slug}`}>
        <Card className="event-card">
          <div className="event-card__image-container">
            <CardImg
              alt={title}
              className="img-fluid"
              src={mainImage || defaultImage}
              top
            />
            <CardImgOverlay />
          </div>
          <div className="event-card__body text-left">
            <div className="event-card__info">
              <h6 className="event-card__title text-truncate">{title}</h6>
              <span className="event-card__date">
                {getPublicEventDate(startTime, endTime)}
              </span>
              <p className="event-card__address">{location}</p>
            </div>
          </div>
        </Card>
      </Link>
    </Col>
  );
};

Events.propTypes = {
  endTime: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  mainImage: PropTypes.string,
  slug: PropTypes.string.isRequired,
  startTime: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

Events.defaultProps = {
  mainImage: null,
};

Events.List = ({ lists }) =>
  lists.map((props) => <Events key={props.title} {...props} />);

export default Events;
