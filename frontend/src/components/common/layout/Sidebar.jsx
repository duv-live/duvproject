import React from 'react';
import PropTypes from 'prop-types';
import RedLogo from 'assets/img/logo/red-white.svg';
import ProfileAvatar from 'assets/img/avatar/profile.png';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Link, Match } from '@reach/router';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { userSideMenu, pseudoEntertainerUserSideMenu } from 'data/menu/user';
import {
  entertainerSideMenu,
  unApprovedEntertainerSideMenu
} from 'data/menu/entertainer';
import bandMemberSideMenu from 'data/menu/band-member';
import administratorSideMenu from 'data/menu/administrator';
import classNames from 'classnames';
import { USER_TYPES } from 'utils/constants';
import { UserContext } from 'context/UserContext';
import { getUserTypeFromStore } from 'utils/localStorage';
import { getProfileName } from 'utils/helpers';

const SIDE_MENU = {
  [USER_TYPES.user]: userSideMenu,
  [USER_TYPES.entertainer]: entertainerSideMenu,
  [USER_TYPES.admin]: administratorSideMenu,
  [USER_TYPES.bandMember]: bandMemberSideMenu
};

const Sidebar = ({ showSidebar, closeSidebar, ...props }) => {
  const { userState } = React.useContext(UserContext);
  const currentUserType = userState.type || getUserTypeFromStore();
  const UnapprovedEntertainer =
    userState.type === USER_TYPES.entertainer &&
    !userState.entertainerProfile.approved;
  const sideMenu = UnapprovedEntertainer
    ? unApprovedEntertainerSideMenu
    : SIDE_MENU[currentUserType];

  return (
    <>
      <div
        className={classNames('backdrop', {
          showSidebar
        })}
        onClick={closeSidebar}
      />
      <aside
        className={classNames('sidebar', {
          showSidebar
        })}
      >
        <div className="sidebar__logo">
          <Link to="/">
            <img alt="Duv Live Red-White Logo" src={RedLogo} />
          </Link>
          <div className="sidebar__close" onClick={closeSidebar}>
            <button
              aria-label="Close"
              className="close d-block d-sm-none"
              type="button"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </div>
        <PerfectScrollbar style={{ height: 'calc(100% - 12rem)' }}>
          <Match path="/user/:item">
            {props =>
              // eslint-disable-next-line react/prop-types
              props.match ? (
                <>
                  <SidebarMenu showUserType={false} />
                  <Sidebar.Navigation
                    closeSidebar={closeSidebar}
                    menus={pseudoEntertainerUserSideMenu}
                  />
                </>
              ) : (
                <>
                  <SidebarMenu />
                  <Sidebar.Navigation
                    closeSidebar={closeSidebar}
                    menus={sideMenu}
                  />
                </>
              )
            }
          </Match>
          <div className="text-center d-block d-sm-none" onClick={closeSidebar}>
            Close Menu
          </div>
        </PerfectScrollbar>
        <div className="clearfix" />
      </aside>
    </>
  );
};

Sidebar.propTypes = {
  closeSidebar: PropTypes.func.isRequired,
  showSidebar: PropTypes.bool.isRequired
};

const SidebarMenu = ({ showUserType }) => {
  let { userState } = React.useContext(UserContext);
  const userName = getProfileName({
    firstName: userState.firstName,
    lastName: userState.lastName,
    stageName:
      userState.entertainerProfile && userState.entertainerProfile.stageName
        ? userState.entertainerProfile.stageName
        : null
  });
  const userType =
    userState.type !== 1 && Object.keys(USER_TYPES)[userState.type];

  return (
    <div className="user-box">
      <div className="user-img">
        <img
          alt={userName}
          className="rounded-circle img-thumbnail img-responsive"
          src={userState.profileImg || ProfileAvatar}
          title={userName}
        />
        <div className="user-status offline" />
      </div>
      <h5 className="text-uppercase">{userName}</h5>
      {showUserType && <small className="text-uppercase">{userType}</small>}
    </div>
  );
};

SidebarMenu.propTypes = {
  showUserType: PropTypes.bool
};

SidebarMenu.defaultProps = {
  showUserType: true
};

Sidebar.Navigation = ({ menus, closeSidebar }) => {
  const sideMenu = menus.map(({ name, menus }) => (
    <ul className="sidebar-menu" key={name}>
      <h6 className="sidebar-menu__header">{name}</h6>
      {menus.map(({ title, to, icon }) => (
        <li key={title}>
          <Link getProps={isActive} onClick={closeSidebar} to={to}>
            <i className={`icon icon-${icon}`} />
            {title}
          </Link>
        </li>
      ))}
    </ul>
  ));
  return <div>{sideMenu}</div>;
};

Sidebar.Navigation.propTypes = {
  closeSidebar: PropTypes.func.isRequired,
  menus: PropTypes.array.isRequired
};

const isActive = ({ isCurrent }) => {
  return isCurrent ? { className: 'active' } : null;
};

export default Sidebar;
