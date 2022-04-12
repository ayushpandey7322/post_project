const jwt = require('jsonwebtoken');
require('dotenv').config();
const { User } = require('../model/userSchema');

class postAuth {
    auth = (req, res, next) => {
        async function f() {
            try {
                let isemail;
                const token = req.headers.authorization.split(" ")[1];   
                const verify = jwt.verify(token, process.env.TOKEN);
               await User.findOne({ email: verify.email }).then((data) => {
                   if (data['token'] == "") {
                        return res.status(401).json({ error:true,message: "already logged out" });
                    }
                    else {
                        req.isemail = verify.email;
                        isemail = data.email;
                        req.isid = data._id;
                    }
               }).catch(err => {
                   return res.status(500).json({ eror:true,message: err.message });
               });
            
                if (verify.email == isemail) {                                                                           
                    next();
                } else { 
                    
                    return res.status(401).json({ error:true,messsage: "not a verified user  " });
                }
            } catch (error) {
          
                if (error.name != "TokenExpiredError") {
                    return res.status(401).json({ error:true,message: "invalid token" });  
                }
                else {
                    return res.status(401).json({ error:true,message: error.message });
                }
            }
        } f();
    }

}
module.exports = { postAuth };