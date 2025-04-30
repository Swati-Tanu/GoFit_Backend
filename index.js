const express = require("express");
const jwt = require("jsonwebtoken");
const { connection } = require("./config/mongo_DB");
const { userRouter } = require("./routes/userRouter");
const { classesRouter } = require("./routes/classesRouter");
const { ordersRouter } = require("./routes/ordersRouter");
const { dashboardRouter } = require("./routes/adminDashRouter");
const { UserModel } = require("./models/userModel");

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));

const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());
const { passport } = require("./google.outh");

app.use(cors({ origin: "*" }));
app.use(passport.initialize());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
  res.send("Backend Side of Go Fit!");
});

app.get("/alltrainer", async (req, res) => {
  try {
    let trainers = await UserModel.find({ role: "trainer" });
    res.status(200).send({ message: "User Data Fetched", trainers });
  } catch (error) {
    res
      .status(400)
      .send({ message: "Something went wrong", error: error.message });
    console.log(error);
  }
});
app.use("/user", userRouter);
app.use("/class", classesRouter);
app.use("/order", ordersRouter);
app.use("/admin", dashboardRouter);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  function (req, res) {
    try {
      // Create a JWT token
      const token = jwt.sign(
        { userId: req.user._id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" } // Token expiration
      );

      // Redirect to the frontend with the token as a query parameter
      res.redirect(
        `https://gofitwebsite.netlify.app/userDashboard.html?token=${token}`
      );
    } catch (error) {
      console.error("Error generating token:", error.message);
      res.redirect("/login"); // Redirect to login if token generation fails
    }
  }
);

app.listen(process.env.port, async () => {
  try {
    await connection;
    console.log("Connected to the db");
  } catch (error) {
    console.log(error);
  }
  console.log(`Listening on port ${process.env.port}`);
});
