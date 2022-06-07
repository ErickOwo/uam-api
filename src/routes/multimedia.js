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

router.delete('/multimedia/:video_id', async (req, res)=>{
  try{
    configCloudinary();

    const { video_id } = req.params;
    const video = await Video.findByIdAndDelete(video_id);
    await cloudinary.uploader.destroy(video.public_id);
    return res.json({message: 'Elemento eliminado', video});
  }
  catch(error){
    return res.status(400).json({ error });
  }
})

module.exports = router;