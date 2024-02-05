const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./config");

 const authMiddleware=(req,res,next)=>{
    const authHeader = req.headers['authorization'];
    console.log("Middleware starts");
    try {
        if(!authHeader){            
            return res.json({message:"Unauthenticated !!"})
        }
    } catch (error) {
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
            console.log(decoded.userId);
            next();
        }
        else{
            return res.status(403).json({});
        }
    } catch (error) {
        return res.status(403).json({});
    }
}

module.exports = {
    authMiddleware
}