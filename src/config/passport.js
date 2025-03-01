// src/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const User = require('../models/User'); // Foydalanuvchi modeli

// Google strategiyasi
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Foydalanuvchini topish yoki yangi foydalanuvchini yaratish
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        // Qo'shimcha ma'lumotlar
      });
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Facebook strategiyasi
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: "/api/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ facebookId: profile.id });
    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email: profile.emails ? profile.emails[0].value : '',
        facebookId: profile.id,
      });
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// GitHub strategiyasi
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "/api/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ githubId: profile.id });
    if (!user) {
      user = await User.create({
        name: profile.username,
        email: profile.emails ? profile.emails[0].value : '',
        githubId: profile.id,
      });
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Passport sessiya (agar kerak bo'lsa, JWT ishlatadigan bo'lsangiz sessiyadan voz kechish mumkin)
// passport.serializeUser(...)
// passport.deserializeUser(...)

module.exports = passport;
