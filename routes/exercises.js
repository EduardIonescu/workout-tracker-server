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

module.exports = router;
