const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

router.post("/register", async (req, res) => {
	const { username, password } = req.body;
	const user = await User.findOne({ username }).exec();
	if (user) {
		res.status(400);
		res.json({
			message: "User alreay exists",
		});
		return;
	}

	const salt = await bcrypt.genSalt();
	const passwordHash = await bcrypt.hash(password, salt);

	const newUser = new User({
		username,
		password: passwordHash,
	});

	await newUser.save();
	res.json({
		message: "success",
	});
});

router.post("/login", async (req, res) => {
	const { username, password } = req.body;
	const user = await User.findOne({ username }).exec();
	if (!user) {
		res.status(403);
		res.json({
			message: "invalid login",
		});
		return;
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		return res.status(400).json({ message: "Invalid login." });
	}

	res.json({
		message: "success",
	});
});

module.exports = router;
