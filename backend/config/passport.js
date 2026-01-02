import {Strategy as GoogleStrategy} from 'passport-google-oauth20';
import {Strategy as FaceboookStrategy} from 'passport-facebook';

const configurePassport = (passport) => {
    // Google OAuth Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    },

    async (accessToken, refreshToken, profile, done) => {
        try {
        } catch (error) {
            
        }
    }
)
)
}