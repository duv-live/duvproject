import React from 'react';
import { Row, Col, Card, CardImg, CardImgOverlay, CardTitle } from 'reactstrap';
import Header from 'components/common/Header';
import BorderedListItem from '../custom/BorderedListItem';
import Text from '../common/Text';
import noGoSpoilYourPartyList from 'data/duvSteps.js';
import entertainerLists from 'data/entertainers.js';
import eventLists from 'data/events.js';

const Home = () => {
  return (
    <div className="home">
      <Landing />
      <Intro />
      <LiveYourLife />
      <Entertainers />
      <Events />
    </div>
  );
};

const Landing = () => (
  <section className="landing">
    <div className="card bg-dark text-white">
      <Header />
      <div className="card-img-overlay">
        <h2 className="card-title">
          GET THE BEST <br />
          DJS, MCS &amp; LIVE BANDS
        </h2>
        <p className="card-text">
          {' '}
          <button className="btn btn-danger btn-lg hvr-sweep-to-right" href="/">
            Hire Entertainers
          </button>{' '}
          &nbsp; &nbsp;
          <button className="btn btn-light btn-lg hvr-sweep-to-left" href="/">
            Become an Entertainer
          </button>
        </p>
      </div>
    </div>
  </section>
);

const Intro = () => (
  <section className="intro spacer">
    <div className="container-fluid">
      <h2 className="header">
        NO GO SPOIL <span className="d-sm-inline d-block">YOUR PARTY O!!!</span>
      </h2>
      <Row className="pt-5">
        <BorderedListItem.List items={noGoSpoilYourPartyList} />{' '}
      </Row>
    </div>
  </section>
);

const LiveYourLife = () => (
  <section className="live-your-life">
    <Row>
      <Col className="live-your-life__content--1 live-your-life__box" sm="4">
        <Text.VerticalAlign>
          {' '}
          <h2 className="title-border">LIVE YOUR BEST LIFE</h2>
          <p>WE TUNE UP YOUR EVENTS</p>
        </Text.VerticalAlign>
      </Col>
      <Col className="live-your-life__content--2 live-your-life__box" sm="4">
        <Text.VerticalAlign>
          <h3>
            HOW IT <span>WORKS</span>
          </h3>
          <p>
            As the world’s leading live entertainment company, we are privileged
            to work with artists to bring their creativity to life on stages
            around the world. Whether it’s two hours at a packed club, or an
            entire weekend of sets at a festival, a live show does more than
            entertain. It can uplift, inspire and create a memory that lasts a
            lifetime
          </p>
        </Text.VerticalAlign>
      </Col>
      <Col className="live-your-life__content--3 live-your-life__box" sm="4">
        <Text.VerticalAlign>
          <h3>
            HIRE AN <span>ENTERTAINER</span>
          </h3>
          <p>
            As the world’s leading live entertainment company, we are privileged
            to work with artists to bring their creativity to life on stages
            around the world. Whether it’s two hours at a packed club, or an
            entire weekend of sets at a festival, a live show does more than
            entertain. It can uplift, inspire and create a memory that lasts a
            lifetime
          </p>
        </Text.VerticalAlign>
      </Col>
    </Row>
  </section>
);

const Entertainers = () => (
  <section className="entertainers spacer">
    <div className="container-fluid">
      <h2 className="header title-border">
        OUR <span>ENTERTAINERS</span>
      </h2>
      <Row className="pt-5">
        <Entertainer.List lists={entertainerLists} />
      </Row>
    </div>
  </section>
);

const Entertainer = ({ name, image, type }) => (
  <Col sm={4}>
    <Card className="entertainer-card">
      <CardImg alt={name} className="img-fluid" src={image} top />
      <CardImgOverlay>
        <CardTitle>{name}</CardTitle>
        <div className="entertainer_type">{type}</div>
      </CardImgOverlay>
    </Card>
  </Col>
);

Entertainer.List = ({ lists }) =>
  lists.map(({ name, image, type }) => (
    <Entertainer image={image} key={name} name={name} type={type} />
  ));

const Events = () => (
  <section className="events spacer">
    <div className="container-fluid">
      <h2 className="header title-border">
        UPCOMING <span>EVENTS</span>
      </h2>
      <Row className="pt-5">
        <Event.List lists={eventLists} />
      </Row>
    </div>
  </section>
);

const Event = ({ title, address, ticket, weekday, date, time, image }) => (
  <Col sm={4}>
    <Card className="event-card">
      <div className="event-card__image-container">
        <CardImg alt={title} className="img-fluid" src={image} top />
        <CardImgOverlay />
      </div>
      <div className="event-card__body">
        <div className="event-card__datetime">
          <span className="event-card__weekday">{weekday},</span>
          <span className="event-card__date"> {date},</span>
          <span className="event-card__time">{time}</span>
        </div>
        <div className="event-card__info">
          <h6 className="event-card__title">{title}</h6>
          <p className="event-card__address">{address}</p>
          <div className="event-card__ticket">Ticket: {ticket}</div>
        </div>
      </div>
    </Card>
  </Col>
);

Event.List = ({ lists }) =>
  lists.map(props => <Event key={lists.title} {...props} />);

export default Home;
