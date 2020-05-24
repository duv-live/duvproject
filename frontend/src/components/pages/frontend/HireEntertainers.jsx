import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import FrontEndPage from 'components/common/layout/FrontEndPage';
import { Row } from 'reactstrap';
import Entertainers from 'components/common/entertainers/Entertainers';
import LoadingScreen from 'components/common/layout/LoadingScreen';

const HireEntertainers = ({ type }) => {
  const [entertainers, setEntertainers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    axios.get(`/api/v1/entertainers`).then(function (response) {
      const { status, data } = response;
      // handle success
      if (status === 200) {
        setEntertainers(data.entertainers);
        setLoading(false);
      }
    });
  }, []);
  return (
    <FrontEndPage title="Hire Entertainers">
      <EntertainerSection
        entertainers={entertainers}
        loading={loading}
        type={type}
      />
    </FrontEndPage>
  );
};

HireEntertainers.propTypes = {
  type: PropTypes.string,
};

HireEntertainers.defaultProps = {
  type: 'None',
};

const EntertainerSection = ({ entertainers, loading, type }) => {
  console.log('entertainers', entertainers);
  const [allEntertainers, setAllEntertainers] = React.useState([]);
  const [currentFilter, setFilter] = React.useState(type);

  React.useEffect(() => {
    const filteredEntertainer = entertainers.filter(
      (entertainer) =>
        entertainer &&
        entertainer.entertainerType &&
        entertainer.entertainerType.toUpperCase() ===
          currentFilter.toUpperCase()
    );
    filteredEntertainer.length > 0
      ? setAllEntertainers(filteredEntertainer)
      : setAllEntertainers(entertainers);
  }, [currentFilter, entertainers]);

  const filterEntertainerByType = (type = 'None') => {
    const ENTERTAINER_TYPE = ['MC', 'DJ', 'LIVEBAND'];

    if (ENTERTAINER_TYPE.includes(type.toUpperCase())) {
      setFilter(type);
    } else {
      setFilter('None');
    }
  };

  const filterButton = (name, filter) => (
    <button
      className={`nav-link btn ${currentFilter === filter && 'active'}`}
      onClick={() => filterEntertainerByType(filter)}
    >
      {name}
    </button>
  );

  return (
    <section className="entertainers spacer">
      <div className="container-fluid">
        <div className="float-right">
          <nav className="nav nav-pills nav-filter nav-pull-right">
            <div className="nav-link disabled btn nav-text">Filter By: </div>
            {filterButton('Show All', 'None')}
            {filterButton('DJ', 'dj')}
            {filterButton('MC', 'mc')}
            {filterButton('Live Band', 'liveband')}
          </nav>
        </div>
        <h2 className="header title-border">
          OUR <span>ENTERTAINERS</span>
        </h2>
        {loading ? (
          <LoadingScreen loading={loading} text="Loading Entertainers" />
        ) : (
          <Row className="pt-5">
            <Entertainers.List lists={allEntertainers} />
          </Row>
        )}
      </div>
    </section>
  );
};

EntertainerSection.propTypes = {
  entertainers: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  type: PropTypes.string,
};

HireEntertainers.defaultProps = {
  type: '',
};

export default HireEntertainers;
