const express = require("express");
const { authMiddleware } = require("../middleware");
const { Account } = require("../db");
const { mongo, default: mongoose } = require("mongoose");
const router =  express.Router();

router.get("/",(req,res)=>{
    return res.json({message:"In acoounts route"})
})

router.get("/balance",authMiddleware,async(req,res)=>{
    const balance = await Account.find({userId:req.userId});
    return res.json({balance:balance[0].balance.toFixed(2),userId:req.userId})
})

router.post("/transfer",authMiddleware,async(req,res)=>{
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
    const {to,amount} = req.body;
    console.log(" Sending to ",to,amount)
    console.log(typeof amount);
    if(!to || isNaN(amount)){
       await session.abortTransaction();
        return res.status(400).json({message:"Amount is not a number"})
    }
    const isValidObjectId = mongoose.Types.ObjectId.isValid(to);

    if (!isValidObjectId) {
        await session.abortTransaction();
        return res.status(400).json({message:"Not a valid id"})
    }

    if(req.userId===to){
        await session.abortTransaction();
        return res.status(400).json({message:"Cannot send money to yourself!!"})
    }

    const account = await Account.findOne({userId:req.userId}).session(session);
    if(account===null||account===undefined || account.balance < amount){
        await session.abortTransaction();
        return res.status(400).json({message:"Insufficient funds in account !!!"}) 
    }
    console.log(to)
    const accountOfUser = await Account.findOne({userId:to}).session(session);
    console.log(accountOfUser)
    if(!accountOfUser){        
        await session.abortTransaction();
        return res.status(400).json({message:"Account not found"}) 
    }
    await Account.updateOne({userId:req.userId},{$inc:{balance:-amount}}).session(session);  
    await Account.updateOne({userId:to},{$inc:{balance:amount}}).session(session);
    
    await session.commitTransaction();
    res.json({
        message: "Transfer successful"
    });
    } catch (error) {
        await session.abortTransaction();
        return res.json({error:error})
    }

})

router.post("/add",authMiddleware,async(req,res)=>{
    const {amount} = req.body;
    if(isNaN(amount)){
        return res.json({message:"Amount is not a number"})
    }
    try {
        await Account.findOne({userId:req.userId},{$inc:{balance:amount}});
        return res.json({message:"Successfully added money to your account"})
    } catch (error) {
        return res.json({message:error})
    }
})

module.exports = router;