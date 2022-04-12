const express = require('express');
const router = express.Router();




const { roles } = require('../controllers/roles');
const ro = new roles;

router.post('/roles', ro.store);
router.get('/roles', ro.index);
router.get('/roles/:id', ro.show);
router.delete('/roles/:id', ro.destroy);
router.put('/roles/:id', ro.update);

module.exports = router;