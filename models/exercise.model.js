const mongoose = require("mongoose");

const exercisesSchema = new mongoose.Schema({
	userId: String,
	exercises: [
		{
			text: String,
			id: String,
			history: [
				{
					date: Date,
					sets: [
						{
							reps: Number,
							weight: Number,
						},
					],
					note: String,
				},
			],
		},
	],
});
module.exports = Exercises = mongoose.model("Exercises", exercisesSchema);
