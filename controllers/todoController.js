const Todo = require('../modules/todoModule');
const User = require('../modules/userModule');
const Redis = require("ioredis");
const redis = new Redis();

const createTodo = async function (req, res, next) {
    try {
        const { todo, id } = req.body;
        if (id == undefined) {
            const newTodo = new Todo({ todo });
            const savedTodo = await newTodo.save();
            if (savedTodo) {
                redis.del('todo', (err, reply) => {
                    if (err) {
                        console.error('Redis Error:', err);
                    } else {
                        console.log('Key deleted:', reply); // Reply will be 1 if key was deleted, 0 if key doesn't exist
                    }
                });
                res.status(200).json({
                    "success": true,
                    "data": "New todo add successfully",
                    "message": 'Todo updated successfully'
                })
            }
        } else {
            // Perform the update operation, updating only the 'todo' field
            const updatedTodo = await Todo.findByIdAndUpdate(id, { todo }, { new: true });

            if (updatedTodo) {
                // If the todo is successfully updated
                redis.del('todo', (err, reply) => {
                    if (err) {
                        console.error('Redis Error:', err);
                    } else {
                        console.log('Key deleted:', reply); // Reply will be 1 if key was deleted, 0 if key doesn't exist
                    }
                });
                res.status(200).json({
                    success: true,
                    data: updatedTodo,
                    message: 'Todo updated successfully'
                });
            }
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getTodo = async function (req, res, next) {
    try {
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 5,
            sort: { createdAt: -1 },
        };
        let todoCache = await redis.get("todo");
        if (todoCache == null || req.query.page == 1) {
            const user = await User.find({ username: req.query.username })

            const result = await Todo.aggregatePaginate([], options)


            if (result.docs.length >= 0) {
                // Convert array of objects to JSON string
                const jsonString = JSON.stringify(result.docs);
                redis.set("todo", jsonString)
                res.status(200).json({
                    success: true,
                    data: result.docs,
                    totalDocs: result.totalDocs,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                    userAccess: user[0].userAccess
                });
            } else {
                res.status(404).json({
                    data: result.docs,
                    message: 'No todos found',
                    userAccess: user[0].userAccess
                });
            }
        } else {
            const user = await User.find({ username: req.query.username })

            const result = await Todo.aggregatePaginate([], options);
            if (result.docs.length > 0) {
                // Convert array of objects to JSON string
                const jsonString = JSON.stringify(result.docs);
                redis.set("todo", jsonString)
                res.status(200).json({
                    success: true,
                    data: result.docs,
                    totalDocs: result.totalDocs,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                    userAccess: user[0].userAccess
                });
            } else {
                res.status(404).json({ message: 'No todos found' });
            }
        }



    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const deleteTodo = async function (req, res, next) {
    try {
        // Assuming the todo ID is passed as a parameter in the URL
        const { id } = req.params;
        // Perform the deletion operation, for example using Mongoose
        const deletedTodo = await Todo.findByIdAndDelete(id);

        if (deletedTodo) {
            // If the todo is successfully deleted

            // Delete the cached data in Redis
            redis.del('todo', (err, reply) => {
                if (err) {
                    console.error('Redis Error:', err);
                } else {
                    console.log('Key deleted:', reply); // Reply will be 1 if key was deleted, 0 if key doesn't exist
                }
            });

            res.status(200).json({
                success: true,
                message: 'Todo deleted successfully'
            });
        } else {
            // If the todo with the given ID is not found
            res.status(404).json({ message: 'Todo not found' });
        }
    } catch (error) {
        // If any error occurs during the deletion process
        res.status(500).json({ message: error.message });
    }
}
const editTodo = async function (req, res, next) {
    try {
        // Extract the todo ID from the URL parameter
        const todoId = req.params.id;

        // Assuming the updated todo data is passed in the request body
        const updatedData = req.body;

        // Perform the update operation, for example using Mongoose
        const updatedTodo = await Todo.findByIdAndUpdate(todoId, updatedData, { new: true });

        if (updatedTodo) {
            // If the todo is successfully updated
            redis.del('todo', (err, reply) => {
                if (err) {
                    console.error('Redis Error:', err);
                } else {
                    console.log('Key deleted:', reply); // Reply will be 1 if key was deleted, 0 if key doesn't exist
                }
            });
            res.status(200).json({
                success: true,
                data: updatedTodo,
                message: 'Todo updated successfully'
            });
        } else {
            // If the todo with the given ID is not found
            res.status(404).json({ message: 'Todo not found' });
        }
    } catch (error) {
        // If any error occurs during the update process
        res.status(500).json({ message: error.message });
    }
}
const completeTodo = async function (req, res, next) {
    try {
        const todoId = req.params.id;
        const todo = await Todo.findById(todoId);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        // Toggle the 'todocompleted' field
        todo.todocompleted = !todo.todocompleted;

        // Save the updated todo
        const updatedTodo = await todo.save();

        if (updatedTodo) {
            // Delete the cached data in Redis
            redis.del('todo', (err, reply) => {
                if (err) {
                    console.error('Redis Error:', err);
                } else {
                    console.log('Key deleted:', reply); // Reply will be 1 if key was deleted, 0 if key doesn't exist
                }
            });

            res.status(200).json({
                success: true,
                data: updatedTodo,
                message: 'Todo updated successfully'
            });
        } else {
            res.status(404).json({ message: 'Todo not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Export controller function(s)
module.exports = {
    createTodo,
    getTodo,
    deleteTodo,
    editTodo,
    completeTodo
};