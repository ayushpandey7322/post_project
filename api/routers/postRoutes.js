const express = require('express');
const router = express.Router();
const { postAuth } = require('../middleware/postAuth');
const AUTH = new postAuth;

const { post } = require('../controllers/post');
const po = new post;


router.get('/posts', AUTH.auth, po.index);
 router.post('/posts', AUTH.auth, po.store);
router.get('/posts/:id', AUTH.auth, po.show);
 router.put('/posts/:id', AUTH.auth, po.update);
router.delete('/posts/:id', AUTH.auth, po.destroy);



module.exports = router;