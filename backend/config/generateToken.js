const jwt=require('jsonwebtoken');

const generateToken=(id)=>{
    //sign a new token with that particular new id
     return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:"30d",
     });
};

module.exports=generateToken;