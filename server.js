const express = require("express");
const app = express();
const connectToDatabase = require("./config/connectToDatabase");
const cors = require("cors");

// Function that connects express app to database
connectToDatabase();

// used to prevent cors policy warning
app.use(cors());

// allows us to use req.body in posts
app.use(express.json({ extended: false }));

// Routes
app.use("/api/posts", require("./routes/users.js"));
app.use("/api/users", require("./routes/users.js"));

// create variable to specify which port app will run; depends if runnng on heroku or locally
let PORT = process.env.PORT || 5000;

// metod to specify on which port we want our app to run w/callback function to check if working
app.listen(PORT, () => console.log(`Server is on port: ${PORT}`));
