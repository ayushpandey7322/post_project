const { User } = require('../model/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authControllersValidation = require('../validations/authControllersValidation');
const validations = new authControllersValidation;


class authControllers {
register = (req, res) => {
    User.findOne({ email: req.body.email }).then ((data) => {
        if (data == null) {

            let answer = validations.registerValidations.validate(req.body);
            if (answer.error) {
                return res.status(400).json({ error:true,message: answer.error.details[0].message });
            }
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({ error:true,message: err.message })
                }
                else {

                    const user = new User({

                        name: req.body.name,
                        email: req.body.email.toLowerCase(),
                        password: hash,
                        gender: req.body.gender.toLowerCase(),
                        isActive: req.body.isActive,

                    });


                    const token = jwt.sign({
                        email: user.email,
                    }, process.env.TOKEN, { expiresIn: '6h' });

                    const userToken = new User({
                        name: req.body.name,
                        email: req.body.email.toLowerCase(),
                        password: hash,

                        gender: req.body.gender.toLowerCase(),
                        isActive: req.body.isActive,
                        token: token,

                    })


                    userToken.save().then(result => {

                        return res.status(201).json({ error:false,data: result })

                    }).catch(err => { return res.status(500).json({ error:true,message: err.message }) });


                }
            })
        }
        else {
            return res.status(400).json({ error:true,message: 'user already exists' });
        }
    }
    ).catch(err => {

        return res.status(500).json({ error:true,message: err.message });
    });
};


login = (req, res) => {
    User.find({ email: req.body.email }).then(user => {
        let answer = validations.loginValidations.validate(req.body);
        if (answer.error) {
            return res.status(400).json({error:true, message: answer.error.details[0].message });
        }

        if (user.length == 0) {
            return res.status(401).json({ error:true,message: 'no user with this email' });
        }

        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if (!result) {
                return res.status(401).json({ error:true,message: 'password matching fail' });
            }
            if (result) {

                const token = jwt.sign({ email: user[0].email }, process.env.TOKEN, { expiresIn: '6h' });

                User.updateOne({ email: req.body.email.toLowerCase() },
                    {
                        $set:
                        {
                            token: token,
                        }
                    },
                    { upsert: true }).then(result => {
                        res.status(201).json({
                            error: false, data: {
                                name: user[0].name,
                                email: user[0].email,
                                gender: user[0].gender,
                                token: token
                            }
                        })
                    });
            }
        })
    }).catch(err => {
        console.log("dfaf");
        return res.status(500).json({ error:true,message: err.message });
    });
};



logout = function (req, res) {
    User.findOne({ email: req.isemail }).then((data) => {
        if (data['token'] == "") {
            res.status(401).json({ error:true,message: "already logged out" });
        }
        else {

            User.updateOne({ email: data.email }, { $set: { token: "" } }, { upsert: true }
            ).then(result => {
                return res.status(200).json({ error:false,message: "logged out" })
            }
            );
        }
    }).catch(err => { return res.status(500).json({ error:true,message: err }); });

};
}

module.exports =  authControllers ;
