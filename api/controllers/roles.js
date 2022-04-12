const { Role } = require('../model/rolesSchema');
const { Policy } = require('../model/policySchema');
require('dotenv').config();
const rolesValidations = require('../validations/rolesValidation');
const validations = new rolesValidations;



class roles {
    store = (req, res) => {
        Role.findOne({ name: req.body.name }).then ((data) => {
            if (data == null) {
                var policyNames = [];
                let answer = validations.storeValidations.validate(req.body);
                if (answer.error) {
                    return res.status(400).json({ error:true,message: answer.error.details[0].message });
                }
                async function f() {
              
                    await Policy.find({
                        _id: { $in: req.body.policyid }
                    }).then (
                        result => {
                            console.log(result.length);
                            for (let i = 0; i < result.length; i++) {
                                policyNames.push(result[i].name);

                            }
                            console.log("dfaf");
                            console.log(policyNames);
                        }, error => {console.log("fsf") });

                    //  return res.json({ msg: "true" });
                    console.log("yyy");
                    console.log(policyNames);
                    const role = new Role({
                        name: req.body.name,
                        display_name: req.body.display_name.toLowerCase(),
                        description: req.body.description,
                        policyid: req.body.policyid,
                        policies: policyNames

                    });


                    role.save().then(result => {

                        return res.status(200).json({ error: false, data: result });

                    }
                    ).catch(err => { return res.status(500).json({ error:true,message: err.message }) });
                }
                f();
            }
            else {
                return res.status(401).json({ error:true,message :'role exist' });
            }
        }).catch(err => {
            return res.status(500).json({ error: true, message: err.message });
        });
    };

    index = (req, res, next) => {
        let keys = Object.keys(req.query);
        let filters = new Object();

        if (keys.includes("name")) {

            filters.name = { $regex: req.query["name"], $options: "i" };
        }
        if (keys.includes("diplay_name")) {
            filters.email = { $regex: req.query["display_name"], $options: "i" };
        }
        Role.find(filters).then(data => {

            if (data.length == 0) {

                return res.status(404).json({ error:true,message: "no role with such query" });
            }
            return res.json({ data: data });
        }).catch(err => {
            return res.status(500).json({ error:true,message: err.message });
        });


    }





    show = (req, res) => {
        Role.findById(req.params.id).then(result => {
            if (result == null) {
                return res.status(404).json({ error:true,message: " role doesn't exist" });
            }
            return res.status(200).json({ error:false,data: result });
        }
        ).catch(err => {
            if (err.name == 'CastError')
                return res.status(404).json({ error:true,message: "id must be in integer format " });
            return res.status(500).json({ error:true,message: err.message });
        });
    }


    destroy = (req, res) => {
        Role.findById(req.params.id).then(result => {
            if (result == null) {
                return res.status(404).json({ error:true,message: "role doesn't exist" });
            }


            let isActive = result['isActive'] = false;

            Role.updateOne({ _id: req.params.id }, {
                $set: {
                    isActive: isActive
                }
            },
                { upsert: true }).then(result => { return res.status(200).json({ error:false,message: "successfully deleted" }); });



        }).catch(err => {
            if (err.name == 'CastError')
                return res.status(404).json({ error:true,message: "id must be in integer format " });
            return res.status(500).json({ error: true, message: err.message });
        });
    }


    update = (req, res) => {                                 
        Role.findOne({ _id: req.params.id },).then((data) => {

            if (data == null) {

                res.json({ msg: "role not exists" });

            } else {
                let name, policyid, policies, display_name;
                var policyNames = [];

                async function f() {

                    if (req.body.policyid != "") {

                        if (req.body.policyid == undefined) {
                            policyid = data.policyid;
                            policies = data.policies;
                        }
                        else {
                            policyid = req.body.policyid;
                            await Policy.find({
                                _id: { $in: req.body.policyid }
                            }).then(
                                result => {

                                    for (let i = 0; i < result.length; i++) {
                                        policyNames.push(result[i].name);

                                    }
                                    policies = policyNames;
                 
                                });

                        }
                  

                    }
                    else {
                        return res.status(404).json({ error:true,message: "roles must have atleast one policy" });
                    }


                    if (req.body.name != "") {

                        if (req.body.name != undefined && req.body.name.toLowerCase() != data.name.toLowerCase()) {

                            return res.status(404).json({ error:true,message: "can't update name of a role" });
                        }
       
                        name = req.body.name == undefined ? data.name : req.body.name.toLowerCase();
                 
                    }
                    else {
                        return res.status(404).json({ error:true,message: "name field can't be empty" });
                    }

                    if (req.body.display_name != "") {
                        display_name = req.body.display_name == undefined ? data.display_name : req.body.display_name;
                    }
                    else {
                        return res.status(404).json({ error:true,message: "display_name field can't be empty" });
                    }



                    let answer = validations.updateValidations.validate(req.body);

                    if (answer.error) {
                        return res.status(400).json({ error:true,message: answer.error.details[0].message });
                    }



                    Role.updateOne({ _id: req.params.id }, {
                        $set: {
                            name: name,

                            policyid: policyid,
                            policies: policies,
                            //password: password,
                            display_name: display_name
                        }

                    },
                        { upsert: true }).then(result => { res.status(200).json({ error:true,data: {name,display_name,policyid,policies} }) });
                } f();
            }
            // }
        }

        ).catch(err => {
            if (err.name == 'CastError')
                return res.status(404).json({ error: true, message: "id must be in integer format " });

            return res.status(500).json({ error: true, message: err.message });
        });
    };
}




module.exports = { roles };