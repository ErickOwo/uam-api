const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const Video = require('../models/Video');
const { response } = require('express');
const { addVideo, deleteVideo } = require('../utils/use-media');

router.get('/multimedia', async (req, res)=>{
  try{
    const data = await Video.find();
    return res.json({data});
  } catch(error){
    return res.status(404).json({error: 'Recurso no encontrado'})
  }
})

router.post('/multimedia', async (req, res)=>{
   try{ 
    const { title, description } = req.body;

    const result = await addVideo(req.file.path, 'UAM/Multimedia');

    const newVideo = await new Video({
      title, 
      description,
      videoURL: result.url,
      public_id: result.public_id,
    });

    await newVideo.save();
    await fs.unlink(req.file.path);

    return res.json({message: 'Objeto agregado correctamente', type: 'success'});
  } catch(error){
    await fs.unlink(req.file.path);
    console.log(error)
    return response.json(error)
  }
});

router.put('/multimedia', async (req, res)=>{
  try{
    if(!req.file) {
      const requestBody = {
        title: req.body.title,
        description: req.body.description
      }
      await Video.findByIdAndUpdate(
        req.body.id, 
        requestBody,
        {
          new: true,
          runValidators: true,
        }
      );
    } else {

      const result = await addVideo(req.file.path, 'UAM/Multimedia');
      
      const mediaToDelete = await Video.findById(req.body.id);

      const requestBody = {
        title: req.body.title,
        description: req.body.description,
        videoURL: result.url,
        public_id: result.public_id
      }
      await Video.findByIdAndUpdate(
        req.body.id, 
        requestBody,
        {
          new: true,
          runValidators: true,
        }
      );
      
      await deleteVideo(mediaToDelete.public_id);
      await fs.unlink(req.file.path);
    }
    return res.json({message: 'Objeto modificado correctamente', type: 'success'})
  } catch(error){
    await fs.unlink(req.file.path);
    console.log(error)
    return res.status(400).json({error});
  }
});

router.delete('/multimedia/:video_id', async (req, res)=>{
  try{

    const { video_id } = req.params;
    const video = await Video.findByIdAndDelete(video_id);
    await deleteVideo(video.public_id);
    return res.json({message: 'Elemento eliminado'});
  }
  catch(error){
    return res.status(400).json({ error });
  }
})

router.get('/multimedia/:video_id', async (req, res)=>{
  try{
    const { video_id } = req.params;
    const video = await Video.findById(video_id);
    
    return res.send(video);
  }
  catch(error){
    return res.status(400).json({ error });
  }
});

module.exports = router;