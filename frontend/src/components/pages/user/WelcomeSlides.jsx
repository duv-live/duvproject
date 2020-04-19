import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Carousel, CarouselIndicators, CarouselItem } from 'reactstrap';
import Card from 'components/custom/Card';
import { getTokenFromStore } from 'utils/localStorage';
import { UserContext } from 'context/UserContext';
import { Loading } from 'components/common/utils/PlayingMusicAnimation';

const WelcomeSlides = ({ items }) => {
  const [animating, setAnimating] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const { userDispatch } = React.useContext(UserContext);

  const skipUserText = () => {
    setLoading(true);
    axios
      .put(
        '/api/v1/users/skip-first-time-text',
        {},
        {
          headers: { 'x-access-token': getTokenFromStore() },
        }
      )
      .then(function (response) {
        const { status } = response;
        if (status === 200) {
          userDispatch({
            type: 'user-hide-first-time-text',
          });
          setLoading(false);
        }
      })
      .catch(function (error) {
        console.log('error', error);
        setLoading(false);
      });
  };

  const onExiting = () => setAnimating(true);
  const onExited = () => setAnimating(false);
  const next = () => {
    if (animating) return;
    const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  };

  const previous = () => {
    if (animating) return;
    const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  };

  const goToIndex = (newIndex) => !animating && setActiveIndex(newIndex);

  const welcomeSlides = items.map(({ color, name, text }, index) => {
    return (
      <CarouselItem key={index} onExited={onExited} onExiting={onExiting}>
        <div className="text-right">
          <button className="small--2" onClick={skipUserText}>
            {loading ? (
              <>
                <Loading />
              </>
            ) : (
              `Don't show again`
            )}
          </button>
        </div>
        <h3>{name}</h3>
        <p>{text}</p>
      </CarouselItem>
    );
  });

  return (
    <Card
      className="onboarding__slides w-100 rounded-0"
      color={items[activeIndex].color}
    >
      <Carousel
        activeIndex={activeIndex}
        next={next}
        previous={previous}
        slide={false}
      >
        <CarouselIndicators
          activeIndex={activeIndex}
          items={items}
          onClickHandler={goToIndex}
        />
        {welcomeSlides}
      </Carousel>
    </Card>
  );
};

WelcomeSlides.propTypes = {
  caption: PropTypes.bool,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.string,
      name: PropTypes.string,
      title: PropTypes.string,
    }).isRequired
  ),
};

WelcomeSlides.defaultProps = {
  caption: false,
};

export default WelcomeSlides;
