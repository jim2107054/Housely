import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FaceboookStrategy } from "passport-facebook";
import User from "../models/User.js";

const configurePassport = (passport) => {
  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },

      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user); //! User exists, so return user. done means no error
          }

          // Check if email already exists
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.authProvider = "google";
            await user.save();
            return done(null, user);
          }

          // Create new user
          user = new User({
            googleId: profile.id,
            username:
              profile.displayName.replace(/\s+/g, "_").toLowerCase() +
              "_" +
              Date.now(),
            email: profile.emails[0].value,
            authProvider: "google",
            isVerified: true,
          });
          await user.save();
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );

  // Facebook OAuth Strategy
  passport.use(
    new FaceboookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ["id", "emails", "displayName"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ facebookId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Check if email already exists
          if (profile.emails && profile.emails[0]) {
            user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
              user.facebookId = profile.id;
              user.authProvider = "facebook";
              await user.save();
              return done(null, user);
            }
          }

          // Create new user
          user = new User({
            facebookId: profile.id,
            username:
              profile.displayName.replace(/\s+/g, "_").toLowerCase() +
              "_" +
              Date.now(),
            email:
              profile.emails && profile.emails[0]
                ? profile.emails[0].value
                : `${profile.id}@facebook.com`,
            authProvider: "facebook",
            isVerified: true,
          });
          await user.save();
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
};
