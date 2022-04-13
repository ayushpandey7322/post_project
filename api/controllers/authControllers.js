const { User } = require('../model/userSchema');
const { Role } = require('../model/rolesSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authControllersValidation = require('../validations/authControllersValidation');
const validations = new authControllersValidation;


class authControllers {
    createUsers = async (req, res) => {

        if (req.body.roleid == 0 && !req.policies.includes("create_superadmin")) {
          
                return res.status(404).json({ error: true, message: "unauthorized access" });
        }
        if (req.body.roleid == 1 && !req.policies.includes("create_admin")) {
            return res.status(404).json({ error: true, message: "unauthorized access" });
        }
        if (req.body.roleid == 2 && !req.policies.includes("create_user")) {
            return res.status(404).json({ error: true, message: "unauthorized access" });
        }
    User.findOne({ email: req.body.email }).then (async(data) => {
        if (data == null) {

            let answer = validations.createUsersValidations.validate(req.body);
            if (answer.error) {
                return res.status(400).json({ error:true,message: answer.error.details[0].message });
            }
            bcrypt.hash(req.body.password, 10, async(err, hash) => {
                if (err) {
                    return res.status(500).json({ error: true, message: err.message })
                }
                else {
                   //////////////////////////////////////////////
                        var rolesIds = [];
                        await Role.find().then (result => {
                            for (let i = 0; i < result.length; i++) {
                                rolesIds.push(result[i]._id);
                            }
                        })
                        if (!rolesIds.includes(req.body.roleid)) {
                            return res.status(404).json({ erro: true, message: "roleid " + req.body.roleid + " not exists" });
                    }
                    //////////////////////////////////////
                        let role;
                        await Role.find({
                            _id: { $in: req.body.roleid }
                        }).then(result => {
                                role = result[0].name;
                              
                           });
                     
                    const user = new User({

                        name: req.body.name,
                        email: req.body.email.toLowerCase(),
                        password: hash,
                        gender: req.body.gender.toLowerCase(),
                        isActive: req.body.isActive,
                        roleid: req.body.roleid,
                        role: role
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
                        roleid: req.body.roleid,
                        role: role,
                        token: token,

                    })


                    userToken.save().then(result => {

                        return res.status(201).json({ error: false, data: result })

                    }).catch(err => { return res.status(500).json({ error: true, message: err.message }) });

          
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



updateUsers = (req, res) => {

    if (req.params.id == 0 && !req.policies.includes("update_admin")) {

        return res.status(404).json({ error: true, message: "unauthorized access" });
    }
    if (req.params.id == 2 && !req.policies.includes("update_user")) {
        return res.status(404).json({ error: true, message: "unauthorized access" });
    }
    User.findOne({ _id: req.params.id },).then(async(data) => {

        if (data == null) {
            res.status(404).json({ error: true, message: "user not exists" });

        }
        else {
            let name, email, gender, roleid, role;

            if (req.body.roleid != "") {

                if (req.body.roleid == undefined) {
                    roleid = data.roleid;
                    role = data.role;
                }
                else {

                    var rolesIds = [];
                    await Role.find().then(result => {
                        for (let i = 0; i < result.length; i++) {
                            rolesIds.push(result[i]._id);
                        }
                    })

                    if (!rolesIds.includes(req.body.roleid)) {
                        return res.status(404).json({ erro: true, message: "roleid " + req.body.roleid + " not exists" });
                    }


                    roleid = req.body.roleid;
                    await Role.find({
                        _id: { $in: req.body.roleid }
                    }).then(result => {
                        role = result[0].name;

                    });



                }


            }
            else {
                return res.status(404).json({ error: true, message: "a user must have a role" });
            }

            if (req.body.name != "") {
                name = req.body.name == undefined ? data.name : req.body.name;

            }
            else {
                return res.status(400).json({ error: true, message: "name field can't be empty" });
            }
            if (req.body.email != "") {

                if (req.body.email != undefined && req.body.email.toLowerCase() != data.email.toLowerCase()) {

                    return res.status(400).json({ error: true, message: "can't update email" });
                }

                email = req.body.email == undefined ? data.email : req.body.email.toLowerCase();

            }
            else {
                return res.status(400).json({ error: true, message: "email field can't be empty" });
            }

            if (req.body.gender != "") {
                gender = req.body.gender == undefined ? data.gender : req.body.gender;
            }
            else {
                return res.status(400).json({ error: true, message: "gender field can't be empty" });
            }

            let answer = validations.updateUsersValidations.validate(req.body);
            if (answer.error) {
                return res.status(400).json({ error: true, message: answer.error.details[0].message });
            }
            User.updateOne(
                { _id: req.params.id },
                {
                    $set:
                    {
                        name: name,
                        email: email,
                        gender: gender,
                        roleid: roleid,
                        role:role,
                        token: data.token
                    }

                },
                { upsert: true }
            ).then(result => { return res.status(201).json({ error: false, data: { name, email, gender,roleid,role } }) });

        }
    }

    ).catch(err => {
        if (err.name == 'CastError')
            return res.status(404).json({ errror: true, message: "id must be in integer format " });
        console.log("faf");
        return res.status(500).json({ error: true, message: err })
    });
};


  
register = async (req, res) => {
        if (!req.policies.includes("register_user")) {
            return res.status(404).json({ error: true, message: "unauthorized  access" });
        }
    User.findOne({ email: req.body.email }).then (async(data) => {
        if (data == null) {
            var roleid, role;
            let answer = validations.registerValidations.validate(req.body);
            if (answer.error) {
                return res.status(400).json({ error:true,message: answer.error.details[0].message });
            }
            bcrypt.hash(req.body.password, 10, async(err, hash) => {
                if (err) {
                    return res.status(500).json({ error: true, message: err.message })
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
                   let id;
                   await userToken.save().then(result => {
                        id = userToken._id;
                        if(id!=0)
                        return res.status(201).json({ error: false, data: result })

                    }).catch(err => { return res.status(500).json({ error: true, message: err.message }) });
                    //console.log(userToken);
                    console.log(userToken._id);
                    if (id == 0) {
                        roleid = 0;
                        role="superadmin";
                      await  User.updateOne(
                            { email: userToken.email },
                            {
                                $set:
                                {
                                    roleid:roleid,
                                    role:role
                                }

                            },
                            { upsert: true }
                      ).then(async result => { return res.status(201).json({ error: false, data: { name: userToken.name, email: userToken.email, gender: userToken.gender, isActive: userToken.isActive, password: userToken.password, token: userToken.token, _id: id, roleid: roleid, role: role}                             }) });
                    }
                    
          
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
        if (!req.policies.includes("login_user")) {
            return res.status(404).json({ error: true, message: "unauthorized access" });
        }
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
        if (!req.policies.includes("logout_user")) {
            return res.status(404).json({ error: true, message: "unauthorized access" });
        }
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
