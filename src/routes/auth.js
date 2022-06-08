const express = require('express');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

const User = require('../models/User');

const schemaRegister = Joi.object({
  name: Joi.string().min(3).max(260).required(),
  email: Joi.string().min(6).max(260).required().email(),
  password: Joi.string().min(8).max(1024).required(),
})

router.get('/user', async (req, res)=>{
  const token = req.header('Authorization');
  try{
    const decode = jwt.decode(token)
    return res.send(decode)

  } catch(error){
    return res.status(400).send(error);
  }
});

router.post('/signup', async (req, res)=>{

  const { error } = schemaRegister.validate(req.body);
  if(error) return res.status(400).json({ error: error.details[0].message });

  const isEmailExist = await User.findOne({ email: req.body.email });
  if(isEmailExist) return res.status(400).json({ error: 'Email ya registrado' });

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password,
  })

  user.save();

  res.send({ error: null, message: "usuario agregado correctamente"});
});


module.exports = router;