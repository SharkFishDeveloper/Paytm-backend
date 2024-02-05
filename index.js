const express = require("express");
const { default: mongoose } = require("mongoose");
const cors = require("cors")

const mongoUri ="mongodb+srv://Shahzeb:avl6zWF21EospzDL@paytm-server-cluster.p8k9iwo.mongodb.net/?retryWrites=true&w=majority"

const app = express();
app.use(cors());
app.use(express.json());

const port = 3000;
const homeRouter = require("./routes/index.js")

const mongGoConnect =async ()=>{
    await mongoose.connect(mongoUri).then(()=>console.log("Connected to db")).catch(()=>console.log("Error in connecting to db"))
}

app.use("/api/v1",homeRouter)

app.listen(port,()=>{
    console.log(`Server running on port ${port}`)
    mongGoConnect();
})

