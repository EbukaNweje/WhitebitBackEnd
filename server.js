require("./config/dbConfig");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const router = require("./routes/userRouter");
const wallet = require("./routes/walletRoute")
const fileUpload = require("express-fileupload");

const PORT = process.env.PORT || 5050;

const app = express();

// Enable CORS for all routes
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"], // Add the allowed methods here
  })
);

// Handle preflight requests
app.options("*", (req, res) => {
  res.status(200).send();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
app.use(morgan("dev"));

app.use("/api", router);
app.use("/api", wallet)


app.get("/", (req, res) => {
  res.send("Welcome to trippy server!");
});
app.get("/login", (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
});
