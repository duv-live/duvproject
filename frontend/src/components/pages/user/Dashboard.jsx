import React from 'react';
import TopMessage from 'components/common/TopMessage';
import Image from 'components/common/Image';
import { randomItem, getItems } from 'utils/helpers';
import djLists from 'data/entertainers/djs';
import mcLists from 'data/entertainers/mcs';
import lbLists from 'data/entertainers/live-bands';

const Dashboard = () => {
  return (
    <div className="main-app">
      <TopMessage message="Welcome back Mariam," />

      <section className="app-content">
        <div className="row">
          <div className="col-sm-8">
            <div className="card card-custom">
              <div className="card-body">
                <h5 className="card-title green">Upcoming Events</h5>

                <div className="table-responsive">
                  <table className="table table-dark table__no-border">
                    <tbody>
                      <tr>
                        <th className="table__number" scope="row">
                          01
                        </th>
                        <td>
                          <div className="table__title text-white">
                            Wedding Ceremony
                          </div>
                          <span>
                            <i className="icon icon-location" />
                            Yaba, Lagos state
                          </span>
                        </td>
                        <td>
                          <span className="text-red">3 days to go</span>
                          <span>
                            <strong className="text-blue"> DJ Cuppy</strong>{' '}
                            (DJ)
                          </span>
                        </td>
                        <td className="text-right">
                          <span>
                            <i className="icon icon-clock" /> Sun, April 17,
                            2019
                          </span>
                          <span>9:00am</span>
                        </td>
                      </tr>
                      <tr>
                        <th className="table__number" scope="row">
                          02
                        </th>
                        <td>
                          <div className="table__title text-white">
                            Birthday Party
                          </div>
                          <span>
                            <i className="icon icon-location" />
                            Yaba, Lagos state
                          </span>
                        </td>
                        <td>
                          <span className="text-green">2 months to go</span>
                          <span>
                            <strong className="text-blue"> High Soul</strong>{' '}
                            (Live Band)
                          </span>
                        </td>
                        <td className="text-right">
                          <span>
                            <i className="icon icon-clock" /> Sun, April 17,
                            2019
                          </span>
                          <span>9:00am</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <br />
                  <br />
                </div>
              </div>
            </div>
            <Dashboard.AuctionTable entertainerList={getItems(djLists, 3)} />
          </div>
          <div className="col-sm-4">
            <Dashboard.RecommendedTable
              entertainerList={[randomItem(lbLists), randomItem(mcLists)]}
            />
            <Dashboard.PendingReview entertainer={djLists[7]} />
          </div>
        </div>
      </section>
    </div>
  );
};

Dashboard.PendingReview = ({ entertainer }) => (
  <div className="card card-custom">
    <div className="card-body">
      <h5 className="card-title red header__with-border">Pending Review</h5>
      <p className="card-text">
        To serve you better, kindly help us improve our service and give other
        users a better understanding about entertainers.
      </p>

      <div className="text-center">
        <img
          alt={entertainer.stage_name}
          className="rounded-circle img-thumbnail img-responsive avatar--large"
          src={entertainer.img.profile}
          title={entertainer.stage_name}
        />{' '}
        <h5 className="card-subtitle card-subtitle--2 mt-3 mb-0 white">
          {entertainer.stage_name}
        </h5>
        <p className="card-subtitle--3">Party DJ on 15th Apr., 2019</p>
        <button className="btn btn-danger btn-wide btn-transparent">
          Rate Now
        </button>
      </div>
    </div>
  </div>
);

Dashboard.AuctionTable = ({ entertainerList }) => (
  <div className="card card-custom">
    <div className="card-body">
      <h5 className="card-title blue">
        Auction (Recent Bids) <br />
        <small className="small--2 text-gray">
          Celebration Party for Wifey on{' '}
          <span className="text-gray">Apr. 7, 2019</span>
        </small>
      </h5>
      <div className="card-subtitle--3 text-gray mb-3">
        Party DJ
        <span className="float-right small--2 text-gray text-normal">
          Closes on 17th Apr, 2019
        </span>
      </div>

      <div className="table-responsive">
        <table className="table table-dark">
          <tbody>
            {entertainerList.map(entertainer => (
              <Dashboard.AuctionRow
                entertainer={entertainer}
                key={entertainer.stage_name + entertainer.id}
              />
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="6">
                <h5 className="main-app__subtitle mt-2 mb-0">
                  Your Budget: N80,000
                </h5>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
);

Dashboard.AuctionRow = ({ entertainer }) => (
  <tr>
    <th scope="row">
      <Image
        className="avatar--small"
        name={entertainer.stage_name}
        src={entertainer.img.profile}
      />
    </th>
    <td>{entertainer.stage_name}</td>
    <td>{entertainer.average_ratings}</td>
    <td className="text-red">N70,000</td>
    <td className="text-right">
      <span className="text-yellow">View Profile</span>
    </td>
    <td className="text-right">
      {' '}
      <span className="text-green">Approve</span>
    </td>
  </tr>
);

Dashboard.RecommendedTable = ({ entertainerList }) => (
  <div className="card card-custom">
    <div className="card-body">
      <h5 className="card-title blue">Recommended For You</h5>
      <div className="table-responsive">
        <table className="table table-dark">
          <tbody>
            {entertainerList.map(entertainer => (
              <Dashboard.RecommendedRow
                entertainer={entertainer}
                key={entertainer.stage_name + entertainer.id}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

Dashboard.RecommendedRow = ({ entertainer }) => (
  <tr>
    <td>
      <Image
        className="avatar--small"
        name={entertainer.stage_name}
        src={entertainer.img.profile}
      />
    </td>
    <td>{entertainer.stage_name}</td>
    <td>
      <span className="text-yellow">{entertainer.type}</span>
    </td>
    <td>{entertainer.average_ratings}</td>
  </tr>
);

export default Dashboard;