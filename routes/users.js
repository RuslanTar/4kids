var express = require('express');
var router = express.Router();

const db_credentials = require('../config/db');
const Sequelize = require('sequelize');
const sequielize = new Sequelize(db_credentials.cred);
const User = require('../models/user')(sequielize, Sequelize);
const bcrypt = require('bcryptjs');
const {checkSchema, validationResult} = require('express-validator/check');
const jwt = require('jsonwebtoken');

router.post('/register', checkSchema({
            login: {
                in: ['body'],
                exists: true,
                isString: true
            },
            password: {
                in: ['body'],
                exists: true,
                isString: true
            },
            email: {
                in: ['body'],
                exists: true,
                isEmail: true
            }
        }), function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const reqUser = req.body;
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(reqUser.password, salt);
        console.log(reqUser.login);
        User.sync().then(() => {
            User.findOne({where: {email: reqUser.email}}).then((user) => {
                if (!user) {
                    User.create({
                        login: reqUser.login,
                        password: hash,
                        email: reqUser.email
                    }).then((user) => {
                        const token = jwt.sign({id: user.id}, 'supersecret', {expiresIn: 86400});
                        res.json({user: user, token: token})
                    })
                } else {
                    res.status(400).json("User exists.")
                }
            })
        })
    });

router.post('/', checkSchema({
    login: {
        in: ['body'],
        exists: true,
        isString: true
    },
    password: {
        in: ['body'],
        exists: true,
        isString: true
    },
    email: {
        in: ['body'],
        exists: true,
        isEmail: true
    }
}), function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const user = req.body;
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(user.password, salt);
    console.log(user.login);
    User.sync().then(() => {
        User.findOne({where: {email: user.email}}).then((user) => {
            if (user) {
                const token = jwt.sign({id: user.id}, 'supersecret', {expiresIn: 86400});
                res.json({user: user, token: token})
            } else {
                res.status(400).json("User not found.")
            }
        })
    })
});

router.delete('/', checkSchema({
    login: {
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
    User.sync().then(() => {
        User.destroy({where: {login: req.body.login}}).then(() => {
            res.json("Success")
        })
    })
});

module.exports = router;
