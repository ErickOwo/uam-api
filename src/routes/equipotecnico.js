const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const Recurso = require('../models/Recurso');
const { addImage, deleteImage } = require('../utils/use-media');

router.get('/equipotecnico', async (req, res)=>{
  try{
    const data = await Recurso.find();
    return res.json({ data });
  } catch(error){
    return res.status(404).json({error: 'Recurso no encontrado'})
  }
})

router.post('/equipotecnico', async (req, res)=>{
  try{
    const { title, description } = req.body;

    const result = await addImage(req.file.path, 'UAM/Equipo Técnico');

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

      const result = await addImage(req.file.path, 'UAM/Equipo Técnico');
      
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
      await deleteImage(mediaToDelete.public_id);
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
    const { recurso_id } = req.params;
    const recurso = await Recurso.findByIdAndDelete(recurso_id);
    await deleteImage(recurso.public_id);
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