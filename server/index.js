const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

//setting up server 
const app = express();

const PORT = process.env.PORT || 5000; // environemnt vaiarble calld port when we deploy app

app.listen(PORT, () => console.log(`Server running on Port: ${PORT}`));

app.use(express.json());

// app.get("/test", (req, res ) =>{
//     res.send("it works");
// } );

//connect to mongoDB
mongoose.connect(process.env.MDB_CONNECT,{ useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
    if (err) return console.log(err);
    console.log("connected to mongo db");
});

//setting up routes 

    //setting up middle wear
app.use("/auth", require("./routes/userRouter"));