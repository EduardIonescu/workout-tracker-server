const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const port = 4000;
require("dotenv").config();

// Set up express
const app = express();
app.use(cors());
app.use(express.json());

// set up mongoose
mongoose.connect(
	process.env.MONGODB_CONNECTION,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	},
	(err) => {
		if (err) throw err;
		console.log("MongoDB connection established");
		app.listen(port, () => {
			console.log(`Example app listening at http://localhost:${port}`);
		});
	}
);

app.use("/users", require("./routes/users"));
app.use("/exercises", require("./routes/exercises"));
