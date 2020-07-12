export default [
  {
    name: 'Navigation',
    menus: [
      {
        title: 'Dashboard',
        to: '/admin/dashboard',
        icon: 'gauge',
      },
      {
        title: 'Entertainers',
        to: '/admin/entertainers',
        icon: 'entertainers',
      },
      {
        title: 'Entertainers Payment',
        to: '/admin/entertainers-payment',
        icon: 'credit-card',
      },
      {
        title: 'Commissions',
        to: '/admin/commission',
        icon: 'wallet',
      },
    ],
  },
  {
    name: 'Users',
    menus: [
      {
        title: 'Registered Users',
        to: '/admin/registered-users',
        icon: 'badge',
      },
      {
        title: 'Auctions',
        to: '/admin/auctions',
        icon: 'auction',
      },
      {
        title: 'Users Payment',
        to: '/admin/users-payment',
        icon: 'credit-card',
      },
      {
        title: 'Upcoming events',
        to: '/admin/upcoming-events',
        icon: 'calendar',
      },
      {
        title: 'Gallery',
        to: '/admin/gallery',
        icon: 'gallery',
      },
      {
        title: 'Videos',
        to: '/admin/videos',
        icon: 'video',
      },
    ],
  },
  {
    name: 'Miscelleneous',
    menus: [
      {
        title: 'Events',
        to: '/admin/events',
        icon: 'calendar',
      },
      {
        title: 'Badges',
        to: '/admin/badges',
        icon: 'badge',
      },
    ],
  },
  {
    name: 'Others',
    menus: [
      {
        title: 'Edit Profile',
        to: '/admin/edit-profile',
        icon: 'user-circle',
      },
      {
        title: 'Invite Friends',
        to: '/admin/invite-friends',
        icon: 'invite-friend',
      },
      {
        title: 'Switch to User Account',
        to: '/user/dashboard',
        icon: 'loop',
      },
      {
        title: 'Help',
        to: '/admin/help',
        icon: 'help',
      },
      {
        title: 'Logout',
        to: '/logout',
        icon: 'logout',
      },
    ],
  },
];

export const administratorTopMenu = [
  {
    title: "Recent Entertainers'  Payment",
    to: '/entertainer/entertainer-payment',
  },
  {
    title: 'Login as User',
    to: '/user/dashboard',
  },
  {
    title: 'Change Password',
    to: '/admin/change-password',
  },
];
