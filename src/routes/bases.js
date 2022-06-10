const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const Base = require('../models/Base');
const { addImage, deleteImage } = require('../utils/use-media');

router.get('/bases', async (req, res)=>{
  try{
    const data = await Base.find();
    return res.json({ data });
  } catch(error){
    return res.status(404).json({error: 'Recurso no encontrado'})
  }
})

router.post('/bases', async (req, res)=>{
  try{
    const { 
      title, 
      description,
      place,
      parrafs } = req.body;

    const result = await addImage(req.file.path, 'UAM/Bases')

    const newObject = await new Base({
      title, 
      description,
      place,
      parrafs: parrafs ? parrafs.split('\r\n').filter(item =>{
        return item != ""
      }) : [],
      imgURL: result.url,
      public_id: result.public_id,
    });

    await newObject.save();
    await fs.unlink(req.file.path);

    return res.json({message: 'Objeto agregado correctamente', type: 'success'});
  }
  catch(error){
    console.log(error)
    return res.status(400).json({error})
  }
});

router.put('/bases', async (req, res)=>{
  try{
    if(!req.file) {
      const requestBody = {
        title: req.body.title,
        description: req.body.description,
        place: req.body.place,
        parrafs: req.body.parrafs ? req.body.parrafs.split('\r\n').filter(item =>{
          return item != ""
        }) : [],
      }
      await Base.findByIdAndUpdate(
        req.body.id, 
        requestBody,
        {
          new: true,
          runValidators: true,
        }
      );
    } else {

      const result = await addImage(req.file.path, 'UAM/Bases');
      
      const mediaToDelete = await Base.findById(req.body.id);

      const requestBody = {
        title: req.body.title,
        description: req.body.description,
        place: req.body.place,
        parrafs: req.body.parrafs ? req.body.parrafs.split('\r\n').filter(item =>{
          return item != ""
        }) : [],
        imgURL: result.url,
        public_id: result.public_id
      }

      await Base.findByIdAndUpdate(
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
    if(fs.unlink) await fs.unlink(req.file.path);
    console.log(error)
    return res.status(400).json({error});
  }
});

router.delete('/bases/:base_id', async (req, res)=>{
  try{
    const { base_id } = req.params;
    const object = await Base.findByIdAndDelete(base_id);
    await deleteImage(object.public_id);
    return res.json({message: 'Elemento eliminado', object});
  }
  catch(error){
    return res.status(400).json({ error });
  }
});

router.get('/bases/:base_id', async (req, res)=>{
  try{
    const { base_id } = req.params;
    const object = await Base.findById(base_id);
    
    return res.send(object);
  }
  catch(error){
    return res.status(400).json({ error });
  }
});

module.exports = router