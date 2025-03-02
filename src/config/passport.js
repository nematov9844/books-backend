// src/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        // If user exists, update Google ID if not set
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save({ validateBeforeSave: false });
        }
        return done(null, user);
      }

      // If user doesn't exist, create new user
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        photo: profile.photos[0].value,
        googleId: profile.id,
        isEmailVerified: true, // Google emails are already verified
        password: Math.random().toString(36).slice(-8), // Random password
        passwordConfirm: Math.random().toString(36).slice(-8) // Will be hashed anyway
      });

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'photos', 'email'],
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        // If user exists, update Facebook ID if not set
        if (!user.facebookId) {
          user.facebookId = profile.id;
          await user.save({ validateBeforeSave: false });
        }
        return done(null, user);
      }

      // If user doesn't exist, create new user
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        photo: profile.photos[0].value,
        facebookId: profile.id,
        isEmailVerified: true, // Facebook emails are already verified
        password: Math.random().toString(36).slice(-8), // Random password
        passwordConfirm: Math.random().toString(36).slice(-8) // Will be hashed anyway
      });

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
