import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import logger from "morgan";
import passport from 'passport';
import FacebookStrategy from 'passport-facebook';
import GoogleStrategy from 'passport-google-oauth';
import bodyParser from "body-parser";

import router from './server/routes';

dotenv.config();

const port = parseInt(process.env.PORT, 10) || 8080;

const app = express();

app.use(passport.initialize());
const facebookStrategy = FacebookStrategy.Strategy;
const googleStrategy = GoogleStrategy.OAuth2Strategy;

passport.authenticate('facebook');
passport.use(new facebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:8080/api/v1/auth/facebook/callback",
  profileFields: ['emails', 'name']
},
function(accessToken, refreshToken, profile, done) {
  const {last_name: lastName, first_name: firstName, email} = profile._json;
  done(null, {firstName, lastName, email});

}
));

passport.use(new googleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:8080/api/v1/auth/google/callback",
  profileFields: ['emails', 'name']

},
function(accessToken, refreshToken, profile, done) {
  const {family_name: lastName,
    given_name: firstName,
    email
  } = profile._json;
  done(null, {firstName, lastName, email});
 }
));

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(router);

// Serve any static files
app.use(express.static(path.join(__dirname, 'build')));

// Handle React routing, return all requests to React app
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.info(`Started up at port ${port}`);
});