const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const Programa = require('../models/Programa');
const { addImage, deleteImage } = require('../utils/use-media');

router.get('/programas', async (req, res)=>{
  try{
    const data = await Programa.find();
    return res.json({ data });
  } catch(error){
    return res.status(404).json({error: 'Recurso no encontrado'})
  }
})

router.post('/programas', async (req, res)=>{
  try{
    const { title, description, info } = req.body;

    const infoBase = JSON.parse(info).data.map(elemento=> {
      const elementoParseado = JSON.parse(elemento);
      const object = {
        subtitle: elementoParseado.subtitle,
        text: JSON.stringify({"parrafs": elementoParseado.text.split('\n').filter(item =>{
          return item != ""
        })}),
        type: elementoParseado.type
      }
      return JSON.stringify(object)
    });

    const result = await addImage(req.file.path, 'UAM/Programas')

    const newObject = await new Programa({
      title, 
      description,
      textContent: infoBase,
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

router.put('/programas', async (req, res)=>{
  try{
    const infoBase = JSON.parse(req.body.info).data.map(elemento=> {
      const elementoParseado = JSON.parse(elemento);
      const object = {
        subtitle: elementoParseado.subtitle,
        text: JSON.stringify({"parrafs": elementoParseado.text.split('\n').filter(item =>{
          return item != ""
        })}),
        type: elementoParseado.type
      }
      return JSON.stringify(object)
    });

    if(!req.file) {
      const requestBody = {
        title: req.body.title,
        description: req.body.description,
        textContent: infoBase
      }
      await Programa.findByIdAndUpdate(
        req.body.id, 
        requestBody,
        {
          new: true,
          runValidators: true,
        }
      );
    } else {

      const result = await addImage(req.file.path, 'UAM/Programas');
      
      const mediaToDelete = await Programa.findById(req.body.id);

      const requestBody = {
        title: req.body.title,
        description: req.body.description,
        textContent: infoBase,
        imgURL: result.url,
        public_id: result.public_id
      }

      await Programa.findByIdAndUpdate(
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

router.delete('/programas/:programa_id', async (req, res)=>{
  try{
    const { programa_id } = req.params;
    const programa = await Programa.findByIdAndDelete(programa_id);
    await deleteImage(programa.public_id);
    return res.json({message: 'Elemento eliminado', programa});
  }
  catch(error){
    return res.status(400).json({ error });
  }
});

router.get('/programas/:programa_id', async (req, res)=>{
  try{
    const { programa_id } = req.params;
    const programa = await Programa.findById(programa_id);
    
    return res.send(programa);
  }
  catch(error){
    console.log(error)
    return res.status(400).json({ error });
  }
});

module.exports = router;