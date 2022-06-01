const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const api = require('./src/routes/auth')
const verifyToken = require('./src/routes/validate-token');

const app = express();

require('dotenv').config();

const port = process.env.PORT || 3005;

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.afysi.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;

mongoose.connect(uri,{useNewUrlParser: true}).then(()=>{
  console.log('base de datos conectada')
})

app.use(bodyParser.json());
app.use('/api', api)

app.listen(port, ()=>{
  console.log(`servidor escuchando en el puesto ${port}`)
})