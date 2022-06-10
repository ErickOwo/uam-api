const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const app = express();

// import routes

const verifyToken = require('./src/routes/validate-token');

const login = require('./src/routes/login');
const users = require('./src/routes/auth');
const messages = require('./src/routes/messages');
const galleryPrincipal = require('./src/routes/galleryprincipal');
const equipoTecnico = require('./src/routes/equipotecnico');
const multimedia = require('./src/routes/multimedia');
const bases = require('./src/routes/bases');
const cooperation = require('./src/routes/cooperation');

// set port

app.set('port', process.env.PORT || 3005);

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.afysi.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;

mongoose.connect(uri,{useNewUrlParser: true}).then(()=>{
  console.log('base de datos conectada')
})

// Middlewares
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// multer configuration
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'src/public/uploads'),
  filename: (req, file, cb) =>{
    cb(null, uuidv4() + path.extname(file.originalname));
  }
})

app.use(multer({storage}).single('media'));

// login
app.use('/api', login);

// Secure routes
app.use('/api', verifyToken, users);
app.use('/api', verifyToken, messages);
app.use('/api', verifyToken, galleryPrincipal);
app.use('/api', verifyToken, bases);
app.use('/api', verifyToken, equipoTecnico);
app.use('/api', verifyToken, multimedia);
app.use('/api', verifyToken, cooperation);

// app listening
app.listen(app.get('port'), ()=>{
  console.log(`servidor escuchando en el puesto ${app.get('port')}`)
})