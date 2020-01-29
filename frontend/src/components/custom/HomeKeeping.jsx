import React from 'react';
import { getToken } from 'utils/localStorage';
import axios from 'axios';
import { UserContext } from 'context/UserContext';

export const HomeKeeping = ({ children, location }) => {
  const { userState, userDispatch } = React.useContext(UserContext);
  React.useEffect(() => {
    if (!userState.isLoggedIn && getToken()) {
      axios
        .get('/api/v1/who-am-i', {
          headers: {
            'x-access-token': getToken()
          }
        })
        .then(function(response) {
          const { status, data } = response;
          if (status === 200) {
            userDispatch({ type: 'user-login', user: data });
          }
        })
        .catch(function(error) {
          console.log('error', error.response.data);
        });
    }
  }, [userDispatch, userState.isLoggedIn]);

  React.useEffect(() => {
    try {
      // trying to use new API - https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    } catch (error) {
      // just a fallback for older browsers
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);
  return children;
};
