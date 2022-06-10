const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const Cooperation = require('../models/Cooperation');
const { addImage, deleteImage } = require('../utils/use-media');

router.get('/cooperation', async (req, res)=>{
  try{
    const data = await Cooperation.find();
    return res.json({ data });
  } catch(error){
    return res.status(404).json({error: 'Recurso no encontrado'})
  }
})

router.post('/cooperation', async (req, res)=>{
  try{
    const { title, description, linkcooperation } = req.body;

    const result = await addImage(req.file.path, 'UAM/Cooperation')

    const newObject = await new Cooperation({
      title, 
      description,
      linkcooperation,
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

router.put('/cooperation', async (req, res)=>{
  try{
    if(!req.file) {
      const requestBody = {
        title: req.body.title,
        description: req.body.description,
        linkcooperation: req.body.linkcooperation

      }
      await Cooperation.findByIdAndUpdate(
        req.body.id, 
        requestBody,
        {
          new: true,
          runValidators: true,
        }
      );
    } else {

      const result = await addImage(req.file.path, 'UAM/Cooperation');
      
      const mediaToDelete = await Cooperation.findById(req.body.id);

      const requestBody = {
        title: req.body.title,
        description: req.body.description,
        linkcooperation: req.body.linkcooperation,
        imgURL: result.url,
        public_id: result.public_id
      }

      await Cooperation.findByIdAndUpdate(
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
    console.log(error)
    return res.status(400).json({error});
  }
});

router.delete('/cooperation/:cooperation_id', async (req, res)=>{
  try{
    const { cooperation_id } = req.params;
    const cooperation = await Cooperation.findByIdAndDelete(cooperation_id);
    await deleteImage(cooperation.public_id);
    return res.json({message: 'Elemento eliminado', cooperation});
  }
  catch(error){
    return res.status(400).json({ error });
  }
});

router.get('/cooperation/:cooperation_id', async (req, res)=>{
  try{
    const { cooperation_id } = req.params;
    const cooperation = await Cooperation.findById(cooperation_id);
    
    return res.send(cooperation);
  }
  catch(error){
    return res.status(400).json({ error });
  }
});

module.exports = router;