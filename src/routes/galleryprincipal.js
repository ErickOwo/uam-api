const express = require('express');
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs-extra');
const Photo = require('../models/Photo');
const router = express.Router();

router.get('/galleryprincipal/get', async (req, res)=>{
  try{
    const gallery = await Photo.find();
    return res.json({data: gallery});
  }
  catch(e){
    console.log(e)
  }
})

router.post('/galleryprincipal/add', async (req, res)=>{
  try{
    const { title, description } = req.body;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'UAM/Principal Gallery'
    });

    const newPhoto = await new Photo({
      title, 
      description,
      imgURL: result.url,
      public_id: result.public_id,
    });

    await newPhoto.save();
    await fs.unlink(req.file.path);

    return res.json({message: 'received'});
  }
  catch(error){
    console.log(error)
    return res.status(400).json({error})
  }
})

module.exports = router;