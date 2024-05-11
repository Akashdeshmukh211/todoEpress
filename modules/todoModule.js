const mongoose = require('mongoose');
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
// Define todo schema
const todoSchema = new mongoose.Schema({
    todo: {
        type: String,
        required: true
    },
    todocompleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
todoSchema.plugin(aggregatePaginate);
// Create and export todo model based on the schema
const Todo = mongoose.model('todo', todoSchema);

module.exports = Todo;
