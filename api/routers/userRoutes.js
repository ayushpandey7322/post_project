const express = require('express');
const router = express.Router();
const { userAuth } = require('../middleware/userAuth');
const AUTH = new userAuth;

const { user } = require('../controllers/user');
const us = new user;


router.get("/users", AUTH.auth, us.index);
router.get('/me', AUTH.verifyToken, us.me);

 router.get('/users/:id', AUTH.auth, us.show);
 router.put('/users/:id', AUTH.personalAuth, us.update);
 router.put('/updatePassword/:id', AUTH.personalAuth, us.updatePassword);
  router.delete('/users:id', AUTH.auth, us.destroy);




module.exports =  router  ;