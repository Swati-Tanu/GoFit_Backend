let UserModel = require("./models/userModel");
const passport = require("passport");

var GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      callbackURL: "https://gofit-api.onrender.com/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        const existingUser = await UserModel.findOne({
          email: profile._json.email,
        });
        if (existingUser) {
          return cb(null, existingUser);
        }

        const newUser = new UserModel({
          name: profile._json.name,
          email: profile._json.email,
          authProvider: "google",
        });

        await newUser.save();
        return cb(null, newUser);
      } catch (err) {
        console.error("Error in Google Strategy:", err.message);
        return cb(err, null);
      }
    }
  )
);

module.exports = { passport };
