const express = require('express');
const router = express.Router();


const { policy } = require('../controllers/policy');
const po = new policy;


router.get('/policy',  po.index);
router.post('/policy',  po.store);
router.get('/policy/:id',  po.show);
router.put('/policy/:id',  po.update);
router.delete('/policy/:id',  po.destroy);



module.exports = router;