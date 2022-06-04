const express = require('express');
const router = express.Router();
const Mail = require('../models/Mail')

router.get('/messages', async(req, res) =>{
  try{
    const messages = await Mail.find();
    return res.json({messages})
  }
  catch(error){
    return res.status(400).json(error);
  }
})

module.exports = router;