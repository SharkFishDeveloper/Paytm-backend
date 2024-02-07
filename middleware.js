const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./config");

 const authMiddleware=(req,res,next)=>{
    const authHeader = req.headers['authorization'];
    console.log("Middleware starts");
    try {
        if( authHeader===null){           
            console.log(authHeader) 
            return res.json({message:"Unauthenticated !!"})
        }
    } catch (error) {
        res.status(400).json({error:error})
        return console.log(error)
    }
    
    console.log("In middle");
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(403).json({});
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token,JWT_SECRET);
        if(decoded.userId){
            req.userId = decoded.userId;
            console.log("User is ",decoded.userId);
            next();
        }
        else{
            return res.status(403).json({message:"Invalid authentication"});
        }
    } catch (error) {
        return res.status(403).json({message:"Invalid authentication"});
    }
}

module.exports = {
    authMiddleware
}