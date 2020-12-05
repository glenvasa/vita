const express = require("express");
const app = express();
const connectToDatabase = require("./config/connectToDatabase");
const cors = require("cors");

app.use(cors());

app.use(express.json({ extended: false }));

connectToDatabase();

app.get("/", (req, res) => res.send("App is working! Congratulations"));

let PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is on port: ${PORT}`));
