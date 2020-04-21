import React from 'react';
import { Router } from '@reach/router';
import Dashboard from 'components/pages/user/Dashboard';
import Auctions from 'components/pages/user/Auctions';
import Requests from 'components/pages/user/Requests';
import Events from 'components/pages/user/Events';
import UserHelp from 'components/pages/user/Help';
import Payments from 'components/pages/user/Payments';
import ViewPayments from 'components/pages/user/ViewPayments';
import SearchEntertainer from 'components/pages/user/SearchEntertainer';
import RecommendedEntertainers from 'components/pages/user/RecommendedEntertainer';
import NewEvent from 'components/pages/user/NewEvent';
import ViewEvent from 'components/pages/user/ViewEvent';
import Bids from 'components/pages/user/Bids';
import EditProfile from 'components/pages/user/EditProfile';
import RegisterAsEntertainer from 'components/pages/user/RegisterAsEntertainer';
import Approval from 'components/pages/user/Approval';
import AddEntertainerToEvent from 'components/pages/user/AddEntertainerToEvent';
import ViewRequest from 'components/pages/user/ViewRequest';
import InviteFriends from 'components/common/pages/InviteFriends';
import Notifications from 'components/common/pages/Notifications';
import ChangePassword from 'components/common/pages/ChangePassword';

const UserRouter = () => (
  <Router>
    <Dashboard path="/dashboard" />
    <Auctions path="/auctions" />
    <Auctions path="/auctions/status/:message" />
    <Requests path="/requests" />
    <ViewRequest path="/request/view/:applicationId" />
    <Events path="/events" />
    <Notifications path="/notifications" />
    <UserHelp path="/help" />
    <Payments path="/payments-history" />
    <ViewPayments path="/payments/view" />
    <SearchEntertainer path="/entertainer/search/:eventEntertainerId" />
    <RecommendedEntertainers path="/entertainer/recommended/:eventEntertainerId" />
    <NewEvent path="/events/new" />
    <NewEvent path="/hire-entertainer" />
    <AddEntertainerToEvent path="events/:id/add-entertainer" />
    <AddEntertainerToEvent path="events/:id/add-entertainer/new-event" />
    <ViewEvent path="events/view/:id" />
    <ViewEvent path="events/view/:id/:message" />
    <Bids path="/auction/bids/:eventEntertainerId" />
    <Approval path="/approval" />
    <InviteFriends path="/invite-friends" />
    <EditProfile path="/edit-profile" />
    <ChangePassword path="/change-password" />
    <RegisterAsEntertainer path="/register-as-entertainer" />
    <Dashboard default />
  </Router>
);

export default UserRouter;

// https://duvlive.herokuapp.com/?trxref=dilqpr8eth&reference=dilqpr8eth
