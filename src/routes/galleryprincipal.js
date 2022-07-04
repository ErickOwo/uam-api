const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const Photo = require('../models/Photo');
const { addImage, deleteImage } = require('../utils/use-media');

router.get('/galleryprincipal', async (req, res)=>{
  try{
    const data = await Photo.find();
    return res.json({ data });
  } catch(error){
    return res.status(404).json({error: 'Recurso no encontrado'})
  }
})

router.post('/galleryprincipal', async (req, res)=>{
  try{
    const { title, description } = req.body;

    const result = await addImage(req.file.path, 'UAM/Principal Gallery')

    const newObject = await new Photo({
      title, 
      description,
      imgURL: result.url,
      public_id: result.public_id,
    });

    await newObject.save();
    await fs.unlink(req.file.path);

    return res.json({message: 'Objeto agregado correctamente', type: 'success'});
  }
  catch(error){
    return res.status(400).json({error})
  }
});

router.put('/galleryprincipal', async (req, res)=>{
  try{
    if(!req.file) {
      const requestBody = {
        title: req.body.title,
        description: req.body.description
      }
      await Photo.findByIdAndUpdate(
        req.body.id, 
        requestBody,
        {
          new: true,
          runValidators: true,
        }
      );
    } else {

      const result = await addImage(req.file.path, 'UAM/Principal Gallery');
      
      const mediaToDelete = await Photo.findById(req.body.id);

      const requestBody = {
        title: req.body.title,
        description: req.body.description,
        imgURL: result.url,
        public_id: result.public_id
      }

      await Photo.findByIdAndUpdate(
        req.body.id, 
        requestBody,
        {
          new: true,
          runValidators: true,
        }
      );
      await deleteImage(mediaToDelete.public_id);
      await fs.unlink(req.file.path);
    }
    return res.json({message: 'Objeto modificado correctamente', type: 'success'})
  } catch(error){
    await fs.unlink(req.file.path);
    return res.status(400).json({error});
  }
});

router.delete('/galleryprincipal/:photo_id', async (req, res)=>{
  try{
    const { photo_id } = req.params;
    const photo = await Photo.findByIdAndDelete(photo_id);
    await deleteImage(photo.public_id);
    return res.json({message: 'Elemento eliminado', photo});
  }
  catch(error){
    return res.status(400).json({ error });
  }
});

router.get('/galleryprincipal/:photo_id', async (req, res)=>{
  try{
    const { photo_id } = req.params;
    const photo = await Photo.findById(photo_id);
    
    return res.send(photo);
  }
  catch(error){
    return res.status(400).json({ error });
  }
});

module.exports = router;