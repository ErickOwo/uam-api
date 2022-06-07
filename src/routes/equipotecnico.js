const express = require('express');
const router = express.Router();
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs-extra');
const Recurso = require('../models/Recurso');


const configCloudinary = () =>{
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

router.get('/equipotecnico', async (req, res)=>{
  try{
    const recursos = await Recurso.find();
    return res.json({data: recursos});
  }
  catch(e){
    console.log(e)
  }
})

router.post('/equipotecnico', async (req, res)=>{
  try{
    const { title, description } = req.body;

    configCloudinary();

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'UAM/Equipo Técnico'
    });

    const newPhoto = await new Recurso({
      name: title, 
      position: description,
      imgURL: result.url,
      public_id: result.public_id,
    });

    await newPhoto.save();
    await fs.unlink(req.file.path);

    return res.json({message: 'Objeto Agregado Correctamente', type: 'success'});
  }
  catch(error){
    await fs.unlink(req.file.path);
    console.log(error)
    return res.status(400).json({error})
  }
});

router.put('/equipotecnico', async (req, res)=>{
  try{
    if(!req.file) {
      const requestBody = {
        name: req.body.title,
        position: req.body.description
      }
      await Recurso.findByIdAndUpdate(
        req.body.id, 
        requestBody,
        {
          new: true,
          runValidators: true,
        }
      );
    } else {
      configCloudinary();

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'UAM/Equipo Técnico'
      });
      
      const mediaToDelete = await Recurso.findById(req.body.id);

      const requestBody = {
        name: req.body.title,
        position: req.body.description,
        imgURL: result.url,
        public_id: result.public_id
      }
      await Recurso.findByIdAndUpdate(
        req.body.id, 
        requestBody,
        {
          new: true,
          runValidators: true,
        }
      );
      await cloudinary.uploader.destroy(mediaToDelete.public_id);
      await fs.unlink(req.file.path);
    }
    return res.json({message: 'Objeto modificado correctamente', type: 'success'})
  } catch(error){
    await fs.unlink(req.file.path);
    return res.status(400).json({error});
  }
});

router.delete('/equipotecnico/:recurso_id', async (req, res)=>{
  try{
    configCloudinary();

    const { recurso_id } = req.params;
    const recurso = await Recurso.findByIdAndDelete(recurso_id);
    await cloudinary.uploader.destroy(recurso.public_id);
    return res.json({message: 'Elemento eliminado', recurso});
  }
  catch(error){
    return res.status(400).json({ error });
  }
});

router.get('/equipotecnico/:recurso_id', async (req, res)=>{
  try{
    const { recurso_id } = req.params;
    const recurso = await Recurso.findById(recurso_id);
    
    return res.send(recurso);
  }
  catch(error){
    return res.status(400).json({ error });
  }
});



module.exports = router;