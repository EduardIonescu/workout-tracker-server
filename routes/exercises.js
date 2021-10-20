const router = require("express").Router();
const Exercises = require("../models/exercise.model");

const ObjectId = require("mongoose").Types.ObjectId;

// Finds the user and returns its _id
const verifyAndGetUserId = async (req, res) => {
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
	return user._id;
};

router.get("/", async (req, res) => {
	const userId = await verifyAndGetUserId(req, res);
	try {
		const { exercises } = await Exercises.findOne({
			userId: userId,
		}).exec();
		res.json(exercises);
	} catch {
		console.log("This account has no exercises");
	}
});

router.post("/", async (req, res) => {
	const exercisesItems = req.body;
	const userId = await verifyAndGetUserId(req, res);

	const exercises = await Exercises.findOne({
		userId: new ObjectId(userId),
	}).exec();
	if (!exercises) {
		await Exercises.create({
			userId: userId,
			exercises: exercisesItems,
		});
	} else {
		exercises.exercises = exercisesItems;
		await exercises.save();
	}
	res.json(exercisesItems);
});

router.post("/:name", async (req, res) => {
	const userId = await verifyAndGetUserId(req, res);
	const name = req.params.name;
	const completedSets = req.body;

	const exercises = await Exercises.findOne(
		{
			userId: userId,
		},
		{
			exercises: 1,
		}
	)
		.exec()
		.catch((err) => console.log(err));
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

router.post("/:name/delete", async (req, res) => {
	const userId = await verifyAndGetUserId(req, res);
	const idToDelete = req.body.id;
	const name = req.params.name;

	const exercises = await Exercises.findOne(
		{
			userId: userId,
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

	exercises._doc.exercises.some((exercise) => {
		if (exercise._doc.text === name) {
			tempExercises = exercise;
			return;
		}
	});
	let indexToDelete;
	const nameIndex = exercises._doc.exercises.indexOf(tempExercises);
	const history = exercises._doc.exercises[nameIndex]._doc.history;
	history.some((item) => {
		if (item._doc._id == idToDelete) {
			indexToDelete = history.indexOf(item);
		}
	});

	try {
		// This is so ugly, make it look better.
		exercises._doc.exercises[nameIndex]._doc.history.splice(
			indexToDelete,
			1
		);

		await exercises.save();

		res.json({ deleted: true });
	} catch (err) {
		console.log(err);
	}

	// Passing the history of a specific exercise for later use
});

module.exports = router;
