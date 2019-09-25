import React from 'react';
import PropTypes from 'prop-types';
import {
  Collapse,
  Navbar,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import { Link } from '@reach/router';
import UserAvatar from 'assets/img/avatar/user.png';

const TopBar = ({ showSidebar }) => {
  return (
    <div className="topbar">
      <Navbar color="transparent" expand>
        <Collapse className="topbar__header" navbar>
          <button
            className={'d-block d-sm-none menu-button'}
            onClick={showSidebar}
          >
            <div />
          </button>

          <span className="navbar-text">Live Your Best Live</span>
          <Nav className="ml-auto" navbar>
            <NavItem>
              <NavLink
                className="topbar__notification d-none d-sm-block"
                tag={Link}
                to="/user/notifications"
              >
                <i className="icon icon-notification" />
                <span className="dot" />
              </NavLink>
            </NavItem>
            <UncontrolledDropdown inNavbar nav>
              <DropdownToggle caret nav>
                <span className="d-none d-sm-inline">Mariam Obi </span>
                <img
                  alt="Mariam Obi"
                  className="rounded-circle img-responsive avatar--small"
                  src={UserAvatar}
                  title="Mariam Obi"
                />{' '}
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem>
                  <Link className="text-color" to="/user/auctions">
                    Auctions
                  </Link>
                </DropdownItem>
                <DropdownItem>
                  <Link className="text-color" to="/user/payments-history">
                    Payment History
                  </Link>
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem>
                  <Link className="text-color" to="/login">
                    Logout
                  </Link>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Collapse>
      </Navbar>
    </div>
  );
};

TopBar.propTypes = {
  showSidebar: PropTypes.func.isRequired
};

export default TopBar;
