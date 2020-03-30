import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import logger from 'morgan';
import passport from 'passport';
import FacebookStrategy from 'passport-facebook';
import GoogleStrategy from 'passport-google-oauth';
import bodyParser from 'body-parser';

import router from './server/routes';

dotenv.config();

const port = parseInt(process.env.PORT, 10) || 8080;

const app = express();

app.use(passport.initialize());
const facebookStrategy = FacebookStrategy.Strategy;
const googleStrategy = GoogleStrategy.OAuth2Strategy;

passport.authenticate('facebook');
passport.use(
  new facebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.HOST}${process.env.FACEBOOK_CALLBACK}`,
      profileFields: ['emails', 'name', 'picture.type(large)']
    },
    function(accessToken, refreshToken, profile, done) {
      const {
        last_name: lastName,
        first_name: firstName,
        email,
        picture: {
          data: { url }
        }
      } = profile._json;
      done(null, { firstName, lastName, email, picture: url });
    }
  )
);

passport.use(
  new googleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.HOST}${process.env.GOOGLE_CALLBACK}`,
      profileFields: ['emails', 'name']
    },
    function(accessToken, refreshToken, profile, done) {
      const {
        email,
        family_name: lastName,
        given_name: firstName,
        picture: picture
      } = profile._json;
      done(null, { firstName, lastName, email, picture });
    }
  )
);

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(router);

router(app);
// set the view engine to ejs
app.set('view engine', 'ejs');

// Serve any static files
app.use(express.static(path.join(__dirname, 'build')));

// Logo displayed in sent emails
app.get('/email-logo.png', function(req, res) {
  res.sendFile(path.join(__dirname, 'server', 'email-template', 'logo.png'));
});

if (process.env.NODE_ENV === 'production') {
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.listen(port, () => {
  console.info(`Started up the server at port ${port}`);
});
