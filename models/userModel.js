const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    // Password is only required if not using Google login
    password: {
      type: String,
      required: function () {
        return this.authProvider !== "google";
      },
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    phone: Number,
    country: String, // Not required for Google login
    sex: String,
    role: { type: String, enum: ["trainer", "client"], default: "client" },
    age: Number,
    height: Number,
    weight: Number,
    healthProblem: [{ type: String }],
    classes: [{ type: String }],
    createdDate: String,
    createdTime: String,
  },
  {
    versionKey: false,
  }
);

const UserModel = mongoose.model("user", userSchema);

module.exports = { UserModel };
