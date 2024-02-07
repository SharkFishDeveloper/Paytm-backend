const express = require("express");
const {User,Account} = require("../db");
const router =  express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const bcrypt = require("bcrypt");
const zod = require("zod");
const { authMiddleware } = require("../middleware");



const signupBody = zod.object({
    username:zod
    .string().email().min(6, "Email should be at least 6 letters")
    ,

    firstName:zod
    .string().min(6, "FirstName should be at least 6 letters")
    .max(20, "FirstName cannot be more than 20 letters long")
    ,

    lastName:zod
    .string().min(6, "lastName should be at least 6 letters")
    .max(20, "lastName cannot be more than 20 letters long")
    ,
    password:zod
    .string().min(6, "Password should be at least 6 letters")
    .max(20, "Password cannot be more than 20 letters long")
    ,
})

const updateBody = zod.object({
	password: zod.string().min(6, "Password should be at least 6 letters")
    .max(20, "Password cannot be more than 20 letters long"),
    firstName: zod.string().min(6, "Firstname should be at least 6 letters")
    .max(20, "Firstname cannot be more than 20 letters long"),
    lastName: zod.string().min(6, "Lastname should be at least 6 letters")
    .max(20, "Lastname cannot be more than 20 letters long"),
})

router.get("/",async(req,res)=>{
    try {
        const allUsers = await Account.find({}).populate('userId');

        return res.json(allUsers.map((account)=>(
            {
            accountId: account._id,
            userId: account.userId ? account.userId._id : null,
            firstName: account.userId ? account.userId.firstName : null,
            }
        )));
    } catch (error) {
        console.log(error)
        return res.status(400).json({message:"Error in fetching users"})
    }
    
})




router.post("/signUP",async(req,res)=>{
    try {
        const {username,firstName,lastName,password} = req.body;

    const validate = signupBody.safeParse(req.body);
    if(!validate.success){
        return res.status(400).json({
            message:validate.error.errors[0].message
        })
    }

    const findUser =await User.find({username,firstName});
    if(findUser.length>0){
        return res.status(400).json({message:"User already exists"});
    }
    else{
        const hashedpassword = await bcrypt.hash(password,10)
        const user = await User.create({username,firstName,lastName,password:hashedpassword});
        const token = jwt.sign({userId:user._id},JWT_SECRET);
        res.cookie("authToken",token)
        // res.setHeader('Authorization',`Bearer ${token}`);
        await Account.create({
            userId:user._id,
            balance:Math.random()*50000
        })
        return res.json({message:"User created successfully",token:token});
    }
    } catch (error) {
        return res.status(402).json({error:error})
    }
})

router.post("/signin",async(req,res)=>{
   try {
    const {username,password} = req.body;
    if(!username || !password){
        return res.status(400).json({message:"Enter proper details"})
    }
     if(true){
        const user = await User.findOne({username:req.body.username});
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        const solvedPassword = await bcrypt.compare(req.body.password,user.password);
        if(!solvedPassword){
            return res.status(401).json({message:"Incorrect password"})
        }else{
            const token = jwt.sign({userId:user._id},JWT_SECRET);

            // res.setHeader('Authorization',`Bearer ${token}`);
            res.cookie("authToken",token)
            console.log(res.getHeader("Authorization"));
            return res.json({message:"Logged in",token:token});
        }
        
    }
    }   
    catch (error) {
        console.error("Error in signin route:");
    return res.status(401).json({message:"Error in signin"})
    
   }
})

router.put("/update",authMiddleware,

async(req,res)=>{
    try {
        console.log("Usr iD ->",req.userId)
        const {password,firstName,lastName} = req.body;
    const {success} = updateBody.safeParse({password,firstName,lastName});
    if(!success){
        return res.json({message:"Enter valid credentials"})
    }else{
        const hashedpassword = await bcrypt.hash(req.body.password,10);
        await User.updateOne({
            _id: req.userId
        },{password:hashedpassword,firstName,lastName})

        return res.json({message:"Success in update"})
    }
        } catch (error) {
        console.log(error);
        return res.json({message:"Error while updating information"})
        
    }
}
)

router.get('/bulk',authMiddleware,async(req,res)=>{
    try {
        const search = req.query.search||"";
    if(!search){
        return res.status(300).json({message:"Enter name to filter"})
    }
    const foundUsers = await User.find({
        $or:[
            {
                firstName:{
                    '$regex':search,
                    '$options':'i'
                }
            },{
                lastName:{
                    '$regex':search,
                    '$options':'i'
                }
            }
        ]
    });
    const foundAccounts = await Account.find({ userId: { $in: foundUsers.map(user => user._id) } });
    res.json({
        foundUsers:foundUsers.map((user=>(
           {
            name: user.firstName,
            id: user._id,
            account: foundAccounts.find(account => account.userId.toString() === user._id.toString())?._id || null
           }
        )))
    })
    } catch (error) {
        return res.status(400).json({error:error})
    }
})


module.exports = router;