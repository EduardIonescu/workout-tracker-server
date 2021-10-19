const router = require("express").Router();
const Exercises = require("../models/exercise.model");

const ObjectId = require("mongoose").Types.ObjectId;

router.get("/", async (req, res) => {
	const { authorization } = req.headers;
	const [, token] = authorization.split(" ");
	const [username, password] = token.split(":");

	const user = await User.findOne({ username }).exec();
	if (!user) {
		res.status(403);
		res.json({
			message: "Invalid access",
		});
		return;
	}

	try {
		const { exercises } = await Exercises.findOne({
			userId: user._id,
		}).exec();
		res.json(exercises);
	} catch {
		console.log("This account has no exercises");
	}
});

router.post("/", async (req, res) => {
	const { authorization } = req.headers;
	const [, token] = authorization.split(" ");
	const [username, password] = token.split(":");

	const exercisesItems = req.body;

	const user = await User.findOne({ username }).exec();
	if (!user) {
		res.status(403);
		res.json({
			message: "invalid access",
		});
		return;
	}

	const exercises = await Exercises.findOne({
		userId: new ObjectId(user._id),
	}).exec();
	if (!exercises) {
		await Exercises.create({
			userId: user._id,
			exercises: exercisesItems,
		});
	} else {
		exercises.exercises = exercisesItems;
		await exercises.save();
	}
	res.json(exercisesItems);
});

router.post("/:name", async (req, res) => {
	const { authorization } = req.headers;
	const [, token] = authorization.split(" ");
	const [username, password] = token.split(":");

	const name = req.params.name;

	const completedSets = req.body;

	const user = await User.findOne({ username }).exec();
	if (!user) {
		res.status(403);
		res.json({
			message: "invalid access",
		});
		return;
	}

	const exercises = await Exercises.findOne(
		{
			userId: user._id,
		},
		{
			exercises: 1,
		}
	).exec();
	if (!exercises) {
		res.status(404);
		res.json({
			message: "Page not found",
		});
		return;
	}

	let tempExercises;

	//tempExercises takes the value of the exercise with with name from :/name
	exercises._doc.exercises.some((exercise) => {
		if (exercise._doc.text === name) {
			tempExercises = exercise;
			return;
		}
	});

	// Get the index of the exercise with the name from :/name
	const nameIndex = exercises._doc.exercises.indexOf(tempExercises);

	// Push the exercises from the client-side to the database
	exercises._doc.exercises[nameIndex]._doc.history.push(completedSets);

	await exercises.save();

	// Passing the history of a specific exercise for later use
	res.json(exercises._doc.exercises[nameIndex]._doc.history);
});

module.exports = router;
