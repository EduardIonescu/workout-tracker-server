const mongoose = require("mongoose");

const todosSchema = new mongoose.Schema({
	userId: String,
	todos: [
		{
			checked: Boolean,
			text: String,
			id: String,
		},
	],
});
module.exports = Todos = mongoose.model("Todos", todosSchema);
