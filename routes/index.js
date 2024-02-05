const express = require("express");
const router =  express.Router();
const userRouter = require("./user.js");
const accountRouter = require("./account.js");

router.get("/index",(req,res)=>{
    res.json({message:"OWOkring routre"})
    console.log("Router wwokring")
})

router.use("/user",userRouter)
router.use("/account",accountRouter)

module.exports = router;