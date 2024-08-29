const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const URL = require("./models/url");
const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const userRoute = require("./routes/user");
const { connectToMongoDB } = require("./connect");
const { restrictToLoggedinUserOnly ,checkAuth} = require("./middleware/auth");
const app = express();
const PORT = 8000;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

connectToMongoDB("mongodb+srv://jainiljain31:jainiljain@cluster0.sitx6.mongodb.net").then(() =>
  console.log("Mongodb Connected")
);

app.use("/url", restrictToLoggedinUserOnly, urlRoute);
app.use("/user", userRoute);
app.use("/",checkAuth, staticRoute);


app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  // console.log(shortId);
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );

  res.redirect(entry.redirectURL);
});
app.listen(PORT, () => {
  console.log(`server started at port:${PORT}`);
});
