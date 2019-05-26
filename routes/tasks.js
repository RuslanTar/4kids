const express = require('express');
const router = express.Router();
const db_credentials = require('../config/db');
const Sequelize = require('sequelize');
const sequielize = new Sequelize(db_credentials.cred);
const Task = require('../models/task')(sequielize, Sequelize);
const SubTask = require('../models/subtask')(sequielize, Sequelize);
const User = require('../models/user')(sequielize, Sequelize);
const { checkSchema, validationResult } = require('express-validator/check');
const jwt = require('jsonwebtoken');

router.get('/all', checkSchema({
    userId: {
        in: ['header'],
        exists: true,
        isInt: true
    }
}), function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const id = jwt.verify(req.headers['x-access-token'], 'supersecret').id;
    Task.sync().then(() => {
        Task.findAll({where: {userId: id}}).then((tasks) => {
            const tasksId = tasks.map(task => {return task.id})
            SubTask.findAll({where: {mainTaskId: tasksId}}).then((subTasks) => {
                res.json(tasks, subTasks)
            })

        })
    })
});

router.get('/category', checkSchema({
    userId: {
        in: ['header'],
        exists: true,
        isInt: true
    },
    category: {
        exists: true
    }
}), function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const id = jwt.verify(req.headers['x-access-token'], 'supersecret').id;
    Task.sync().then(() => {
        Task.findAll({where: {userId: id, category: req.params.category}}).then((tasks) => {
            const tasksId = tasks.map(task => {return task.id})
            SubTask.findAll({where: {mainTaskId: tasksId}}).then((subTasks) => {
                res.json(tasks, subTasks)
            })

        })
    })
});

router.post('/', checkSchema({
    name: {
        in: ['body'],
        exists: true,
        isString: true
    },
    award: {
        in: ['body'],
        exists: true,
        isString: true
    },
    completed: {
        in: ['body'],
        exists: true,
        isBoolean: true
    },
    time: {
        in: ['body'],
        exists: true,
        isString: true
    },
    priority: {
        in: ['body'],
        exists: true,
        isInt: true
    },
    'x-access-token': {
        exists: {
            errorMessage: 'Header x-access-token is required'
        }
    }
}), function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const task = req.body;
    const id = jwt.verify(req.headers['x-access-token'], 'supersecret').id;

    Task.sync().then(() => {
        Task.findOne({ where: {id: task.id} }).then((foundedTask) => {
            if (!foundedTask) {
                Task.create({
                    name: task.name,
                    award: task.award,
                    completed: JSON.parse(task.completed),
                    userId: id,
                    time: task.time,
                    priority: task.priority
                }).then((createdTask) => {

                    if (task.subTasks) {
                        const doneSubTasks = JSON.parse(task.subTasks);
                        doneSubTasks.forEach(function(element) {
                            SubTask.create({
                                title: element.title,
                                isDone: element.isDone,
                                mainTaskId: createdTask.id
                            });
                            console.log(element);
                        });
                    }
                    res.json("Success")
                })
            } else {
                Task.sync().then(() => {
                    Task.update({
                        name: task.name,
                        award: task.award,
                        completed: JSON.parse(task.completed),
                        userId: id,
                        time: task.time,
                        priority: task.priority
                    },{where: {id: task.id}}).then((createdTask) => {
                        if (task.subTasks) {
                            task.subTasks.forEach(function(element) {
                                SubTask.sync().then(() => {
                                    SubTask.update({
                                        title: element.title,
                                        isDone: element.isDone,
                                        mainTaskId: createdTask.id
                                    });
                                });

                                console.log(element);
                            });
                        }
                        res.json("Success")
                    })
                })
            }
        })
    })
});


router.delete('/', checkSchema({
    name: {
        in: ['body'],
        exists: true,
        isString: true
    },
    'x-access-token': {
        exists: {
            errorMessage: 'Header x-access-token is required'
        }
    }
}), function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    Task.sync().then(() => {
        Task.destroy({where: {name: req.body.name}}).then(() => {
            res.json("Success")
        })
    })
});



module.exports = router;
