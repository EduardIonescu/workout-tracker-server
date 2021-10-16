const router = require("express").Router();
const Todos = require("../models/todo.model");

const ObjectId = require("mongoose").Types.ObjectId;

router.post("/", async (req, res) => {
	const { authorization } = req.headers;
	const [, token] = authorization.split(" ");
	const [username, password] = token.split(":");

	const todosItems = req.body;

	const user = await User.findOne({ username }).exec();
	if (!user) {
		res.status(403);
		res.json({
			message: "invalid access",
		});
		return;
	}

	const todos = await Todos.findOne({
		userId: new ObjectId(user._id),
	}).exec();
	if (!todos) {
		await Todos.create({
			userId: user._id,
			todos: todosItems,
		});
	} else {
		todos.todos = todosItems;
		await todos.save();
	}

	res.json(todosItems);
});

router.get("/", async (req, res) => {
	const { authorization } = req.headers;
	const [, token] = authorization.split(" ");
	const [username, password] = token.split(":");

	const user = await User.findOne({ username }).exec();
	if (!user) {
		res.status(403);
		res.json({
			message: "invalid access",
		});
		return;
	}

	try {
		const { todos } = await Todos.findOne({ userId: user._id }).exec();
		res.json(todos);
	} catch {
		console.log("This account has no todos");
	}
});

module.exports = router;
