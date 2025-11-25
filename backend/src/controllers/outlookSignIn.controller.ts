import passport from "passport"
import { ENV } from "../configs/env"
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { outlookLogIn } from "../services/outlookSignIn.services";

passport.use(new MicrosoftStrategy({
    clientID: ENV.OUTLOOK_APP_ID,
    clientSecret: ENV.OUTLOOK_APP_SECRET,
    callbackURL: ENV.OUTLOOK_REDIRECT_URL,
    scope: ['user.read', 'openid', 'profile', 'email'],
}, outlookLogIn));
export {passport}