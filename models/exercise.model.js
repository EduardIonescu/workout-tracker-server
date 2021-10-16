const mongoose = require("mongoose");

const exercisesSchema = new mongoose.Schema({
	userId: String,
	exercises: [
		{
			text: String,
			id: String,
		},
	],
});
module.exports = Exercises = mongoose.model("Exercises", exercisesSchema);
