const { default: mongoose } = require("mongoose");
//avl6zWF21EospzDL
// mongoose.set('strictPopulate', false);
const userScheme = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        min:4,
        max:20
    },
    lastName:{
        type:String,
        required:true,
        min:4,
        max:20
    },
    password:{
        type:String,
        required:true,
        min:6,
        max:20
    },
    username:{
        type:String,
        required:true,
        min:6,
        max:20,
        unique:true
    }
})

const accountSchema  = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    balance:{
        type:Number,
        required:true
    }
})
const Account = mongoose.model('Account', accountSchema);
const User = mongoose.model('User',userScheme)
module.exports = {User,Account};