require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 1001;
const cors = require("cors");
const bodyParser = require("body-parser");
const formMapping = require("./form-mapping.json");
const auth = require("./middlewares/auth");
const authRoutes = require("./routes/auth");
const basicInformation = require("./routes/basic-information");
const post = require("./routes/post");
const gallery = require("./routes/gallery");
const image = require("./routes/image");
const blog = require("./routes/blog");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/api/form-mapping", auth, (req, res) => {
  res.json(formMapping);
});

app.use("/api/auth", authRoutes);
app.use("/api/basic-information", basicInformation);
app.use("/api/post", post);
app.use("/api/gallery", gallery);
app.use("/api/image", image);
app.use("/api/blog", blog);

app.use(express.static("public"));

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
