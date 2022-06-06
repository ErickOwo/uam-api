const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const users = require('./src/routes/auth')
const verifyToken = require('./src/routes/validate-token');
const messages = require('./src/routes/messages');
const galleryPrincipal = require('./src/routes/galleryprincipal');
const equipoTecnico = require('./src/routes/equipotecnico');

const app = express();


app.set('port', process.env.PORT || 3005);

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.afysi.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;

mongoose.connect(uri,{useNewUrlParser: true}).then(()=>{
  console.log('base de datos conectada')
})

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//multer configuration
const storage = multer.diskStorage({
  destination: path.join(__dirname, 'src/public/uploads'),
  filename: (req, file, cb) =>{
    cb(null, uuidv4() + path.extname(file.originalname));
  }
})

app.use(multer({storage}).single('image'));


app.use('/api', users);
app.use('/api', verifyToken, messages);
app.use('/api', verifyToken, galleryPrincipal);
app.use('/api', verifyToken, equipoTecnico);

app.listen(app.get('port'), ()=>{
  console.log(`servidor escuchando en el puesto ${app.get('port')}`)
})