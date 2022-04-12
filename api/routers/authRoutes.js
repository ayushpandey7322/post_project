const express = require('express');
const router = express.Router();
const { userAuth } = require('../middleware/userAuth');
const AUTH = new userAuth;

const authControllers = require('../controllers/authControllers');
const us = new authControllers;


router.post('/register', us.register);
router.post('/login', us.login);
router.post("/logout", AUTH.verifyToken, us.logout);



module.exports = router;