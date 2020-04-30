import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Row, Col } from 'reactstrap';
import FrontEndPage from 'components/common/layout/FrontEndPage';
import Entertainers from 'components/common/entertainers/Entertainers';
import Stars from 'components/common/utils/Stars';
import Badges from 'components/pages/entertainer/Badges';
import Image from 'components/common/utils/Image';
import Video from 'components/pages/entertainer/Video';
import DuvLiveModal from 'components/custom/Modal';
import { getTokenFromStore } from 'utils/localStorage';
import LoadingScreen from 'components/common/layout/LoadingScreen';
import { commaNumber } from 'utils/helpers';
import { getYear } from 'utils/date-helpers';
import ReactTimeago from 'react-timeago';
import Humanize from 'humanize-plus';

const SingleEntertainer = ({ slug }) => {
  const [entertainer, setEntertainer] = React.useState({
    profile: { stageName: slug },
  });
  const [otherEntertainers, setOtherEntertainers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    slug &&
      axios.get(`/api/v1/entertainer/${slug}`).then(function (response) {
        const { status, data } = response;
        // handle success
        if (status === 200) {
          setEntertainer(data.entertainer);
          setOtherEntertainers(data.otherEntertainers);
          setLoading(false);
        }
      });
  }, [slug]);

  return (
    <FrontEndPage
      subtitle="Hire Entertainers"
      title={entertainer.profile.stageName}
    >
      {loading ? (
        <LoadingScreen loading={loading} text={`Loading ${slug} information`} />
      ) : (
        <LoadEntertainerInfo
          entertainer={entertainer}
          otherEntertainers={otherEntertainers}
        />
      )}
    </FrontEndPage>
  );
};

SingleEntertainer.propTypes = {
  slug: PropTypes.string,
};

SingleEntertainer.defaultProps = {
  slug: null,
};

const LoadEntertainerInfo = ({ entertainer, otherEntertainers }) => (
  <>
    <EntertainerSection entertainer={entertainer} />
    {getTokenFromStore() && (
      <>
        <EntertainerSectionInfo entertainer={entertainer} />
        {false && <UpcomingEvents />}

        {entertainer.badges && entertainer.badges.length > 0 && (
          <Awards badges={entertainer.badges} />
        )}

        {entertainer.galleries && entertainer.galleries.length > 0 && (
          <Gallery galleries={entertainer.galleries} />
        )}

        {entertainer.videos && entertainer.videos.length > 0 && (
          <Videos videos={entertainer.videos} />
        )}
        {entertainer.profile &&
          entertainer.profile.ratings &&
          entertainer.profile.ratings.length > 0 && (
            <ReviewSection ratings={entertainer.profile.ratings} />
          )}
      </>
    )}
    <OtherEntertainersSection entertainers={otherEntertainers} />
  </>
);

LoadEntertainerInfo.propTypes = {
  entertainer: PropTypes.object.isRequired,
  otherEntertainers: PropTypes.array.isRequired,
};

const EntertainerSection = ({ entertainer }) => (
  <section className="single-entertainer">
    <div className="container-fluid">
      <Row>
        <Col sm="3">
          <img
            alt={entertainer.stageName}
            className="img-fluid img-thumbnail img-entertainer"
            src={entertainer.profileImageURL}
          />
        </Col>
        <Col sm="9">
          <section className="entertainer__summary">
            <h2 className="entertainer__summary--title text-capitalize">
              {entertainer.profile.stageName}
            </h2>
            <div className="text-danger">
              {entertainer.profile.entertainerType}
            </div>
            <section className="entertainer__summary--content">
              <div className="row">
                <div className="col-sm-9">{entertainer.profile.about}</div>
              </div>
            </section>
            {/* <button
              className="btn btn-danger btn-transparent btn-lg"
              type="submit"
            >
              Hire {entertainer.profile.stageName}
            </button> */}
          </section>
        </Col>
      </Row>
    </div>
  </section>
);

EntertainerSection.propTypes = {
  entertainer: PropTypes.object.isRequired,
};

const EntertainerSectionInfo = ({ entertainer }) => {
  const avgRatings = entertainer.avgRatings[0];
  const totalShows = entertainer.profile.hired
    ? entertainer.profile.hired.length
    : 0;
  return (
    <section
      className={`entertainer-info ${entertainer.profile.entertainerType.toLowerCase()} mt-5`}
    >
      <div className="container-fluid">
        <Row>
          <h4 className="text-uppercase col-12 font-weight-normal mb-5">
            Information
          </h4>
          <Col sm="4">
            <InfoList title="Stage Name">
              {entertainer.profile.stageName}
            </InfoList>
            <InfoList title="Speciality">
              {entertainer.profile.entertainerType}
            </InfoList>
            <InfoList title="Years of Experience">
              {parseInt(getYear(Date.now()), 10) -
                parseInt(entertainer.profile.yearStarted, 10)}{' '}
              years
            </InfoList>
            <InfoList title="Total Shows">
              {totalShows} {Humanize.pluralize(totalShows, 'Show')}
            </InfoList>
          </Col>
          <Col sm="4">
            <InfoList title="Member Since">
              {getYear(entertainer.profile.createdAt)}
            </InfoList>
            <InfoList title="Location">
              {' '}
              {entertainer.profile.location}
            </InfoList>
            <InfoList title="Average Charges">
              {commaNumber(entertainer.profile.baseCharges)} -{' '}
              {commaNumber(entertainer.profile.preferredCharges)}
            </InfoList>
            <InfoList title="Willing to Travel for Shows">
              {entertainer.profile.willing_to_travel ? 'YES' : 'NO'}
            </InfoList>
          </Col>
          <Col sm="4">
            <InfoStar
              rating={avgRatings.professionalism}
              title="Professionalism"
            />
            <InfoStar rating={avgRatings.accommodating} title="Accommodating" />
            <InfoStar
              rating={avgRatings.overallTalent}
              title="Overall Talent"
            />
            <InfoStar rating={avgRatings.recommend} title="Recommend" />
          </Col>
        </Row>
      </div>
    </section>
  );
};

EntertainerSectionInfo.propTypes = {
  entertainer: PropTypes.object.isRequired,
};

const UpcomingEvents = ({ events }) => {
  return (
    <section className="my-5 py-5">
      <div className="container-fluid">
        <div className="row">
          <h4 className="text-uppercase col-12 font-weight-normal mb-3">
            Upcoming Events
          </h4>
          <UpcomingEvent event={events} />
          <UpcomingEvent event={events} />
        </div>
      </div>
    </section>
  );
};

const UpcomingEvent = ({ event }) => (
  <aside className="col-md-6">
    <div className="table-responsive">
      <table className="table table-dark table__no-border table__with-bg">
        <tbody>
          <tr>
            <td className="pl-4">
              <span className="subtitle--2 text-red text-uppercase">
                APR. 11 (SUN) {event && event}
              </span>
              <span className="small--3 text-gray">9:00am - 4:00pm</span>
            </td>
            <td>
              <div className="table__title text-white">Wedding Ceremony</div>
              <span>
                <i className="icon icon-location" />
                Yaba, Lagos state
              </span>
            </td>
            <td>
              <span className="text-yellow">DJ, Live Band</span>
              <span>DJ Cuppy, High Soul</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </aside>
);

EntertainerSectionInfo.propTypes = {
  entertainer: PropTypes.object.isRequired,
};

const InfoList = ({ title, children }) => (
  <div className="entertainer-info__list">
    <h6>{title}</h6>
    <h3>{children}</h3>
  </div>
);

InfoList.propTypes = {
  children: PropTypes.any,
  title: PropTypes.string.isRequired,
};

InfoList.defaultProps = {
  children: null,
};

const InfoStar = ({ title, rating }) => {
  return (
    <div className="entertainer-info__list">
      <h6>{title}</h6>
      {rating === 0 || rating == null ? (
        <span className="text-uppercase">No Ratings Yet</span>
      ) : (
        <Stars name={title} rating={parseFloat(rating)} />
      )}
    </div>
  );
};

InfoStar.propTypes = {
  rating: PropTypes.any,
  title: PropTypes.string.isRequired,
};

InfoStar.defaultProps = {
  rating: null,
};

const Awards = ({ badges }) => {
  return (
    <section className="my-5 py-5">
      <div className="container-fluid">
        <div className="row">
          <h4 className="text-uppercase col-12 font-weight-normal mb-3">
            Awards
          </h4>
          <Badges.CardLists badges={badges} />
        </div>
      </div>
    </section>
  );
};

Awards.propTypes = {
  badges: PropTypes.array.isRequired,
};

const Gallery = ({ galleries }) => {
  return (
    <section className="my-5 py-5">
      <div className="container-fluid">
        <div className="row">
          <h4 className="text-uppercase col-12 font-weight-normal mb-3">
            Gallery
          </h4>
          {galleries.map(({ imageURL, id, approved }, index) => (
            <GalleryImage key={id} name={'gallery' + index} src={imageURL} />
          ))}
        </div>
      </div>
    </section>
  );
};

Gallery.propTypes = {
  galleries: PropTypes.array.isRequired,
};

const GalleryImage = ({ name, src }) => (
  <div className="card col-lg-3 col-md-4 col-6 gallery-card-image">
    <DuvLiveModal
      body={
        <>
          <Image.Big
            className="img-fluid"
            name={name}
            rounded={false}
            src={src}
          />
        </>
      }
    >
      <Image
        bordered
        className="img-fluid small"
        name="gallery"
        rounded={false}
        src={src}
      />
    </DuvLiveModal>
  </div>
);

GalleryImage.propTypes = {
  name: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
};

const Videos = ({ videos }) => {
  return (
    <section className="my-5 py-5">
      <div className="container-fluid">
        <div className="row">
          <h4 className="text-uppercase col-12 font-weight-normal mb-3">
            Videos
          </h4>
          {videos.map(({ title, youtubeID }, index) => (
            <YoutubeVideo key={index} title={title} youtubeID={youtubeID} />
          ))}
        </div>
      </div>
    </section>
  );
};

Videos.propTypes = {
  videos: PropTypes.array.isRequired,
};

const YoutubeVideo = ({ title, youtubeID }) => (
  <section className="d-block col-md-4 mb-4">
    <div className="card card__with-icon position-relative">
      <DuvLiveModal
        body={<Video.ModalCard title={title} youtubeID={youtubeID} />}
        className="modal-full"
        title={title}
      >
        <Video.YoutubeImage title={title} youtubeID={youtubeID} />
        <Video.YoutubeOverlay title={title} youtubeID={youtubeID} />
      </DuvLiveModal>
    </div>
  </section>
);

YoutubeVideo.propTypes = {
  title: PropTypes.string.isRequired,
  youtubeID: PropTypes.any.isRequired,
};

const ReviewSection = ({ ratings }) => {
  return (
    <section className="my-5 py-5">
      <div className="container-fluid">
        <div className="row">
          <h4 className="text-uppercase col-12 font-weight-normal mb-3">
            Reviews
          </h4>
          {ratings.map((rating, index) => (
            <ReviewSectionCard
              averageRating={
                (rating.professionalism +
                  rating.overallTalent +
                  rating.recommend +
                  rating.accommodating) /
                4
              }
              comment={rating.review}
              key={index}
              profileImageURL={rating.rater.profileImageURL}
              reviewDate={rating.createdAt}
              title={rating.ratedEvent.event.eventType}
              userName={rating.rater.firstName}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

ReviewSection.propTypes = {
  ratings: PropTypes.array.isRequired,
};

const ReviewSectionCard = ({
  averageRating,
  comment,
  profileImageURL,
  reviewDate,
  title,
  userName,
}) => (
  <div className="w-100">
    <div className="card">
      <div className="card-body">
        <div className="row py-3">
          <div className="col-md-1 col-sm-2 col-2">
            <Image name={userName} rounded={false} src={profileImageURL} />
          </div>
          <div className="col-md-11 col-sm-10 col-10">
            <div className="float-right">
              <Stars name="Professionalism" rating={averageRating} />
            </div>
            <h6 className="text-font-weight-normal text-white">{title}</h6>
            <div className="clearfix" />
            <p className="mb-0 text-muted-light-2">{comment}</p>
            <small className="text-muted">
              Reviewed by {userName}, <ReactTimeago date={reviewDate} />
            </small>
          </div>
        </div>
        <hr />
      </div>
    </div>
  </div>
);

ReviewSectionCard.propTypes = {
  averageRating: PropTypes.number.isRequired,
  comment: PropTypes.string.isRequired,
  profileImageURL: PropTypes.string.isRequired,
  reviewDate: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
};

const OtherEntertainersSection = ({ entertainers }) => (
  <section className="other-entertainers mt-5 py-5">
    <div className="container-fluid">
      <h3 className="header title-border">
        RELATED <span>ENTERTAINERS</span>
      </h3>
      <Row className="pt-5">
        <Entertainers.List lists={entertainers || []} />
      </Row>
    </div>
  </section>
);

OtherEntertainersSection.propTypes = {
  entertainers: PropTypes.array.isRequired,
};

export default SingleEntertainer;
