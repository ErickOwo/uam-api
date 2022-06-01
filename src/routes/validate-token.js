const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) =>{
  const token = req.header('auth-token');
  if(!token) res.status(401).json({ error: 'acceso denegado' });

  try{
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  }
  catch(e){
    res.status(400).json({ error: 'token no es valido' });
  }
}

module.exports = verifyToken;