const express = require('express');
const router = express.Router();
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs-extra');
const Video = require('../models/Video');
const { response } = require('express');

const configCloudinary = () =>{
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

router.get('/multimedia', async (req, res)=>{
  try{
    const videos = await Video.find();
    return res.json({data: videos});
  }
  catch(e){
    console.log(e)
  }
})

router.post('/multimedia', async (req, res)=>{
   try{ 
    const { title, description } = req.body;

    configCloudinary();

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'UAM/Multimedia',
      resource_type: "video",
      eager_async: true,
      chunk_size: 20000000,
    });

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
      configCloudinary();

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'UAM/Multimedia',
        resource_type: "video",
        eager_async: true,
        chunk_size: 20000000,
      });
      
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
      
      await cloudinary.api.delete_resources(mediaToDelete.public_id, { resource_type: "video" });
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
    configCloudinary();

    const { video_id } = req.params;
    const video = await Video.findByIdAndDelete(video_id);
    await cloudinary.api.delete_resources(video.public_id, { resource_type: "video" });
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