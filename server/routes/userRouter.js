const router = require("express").Router();
const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//register post

router.post("/", async (req, res) => {
    // res.send("test");
    // console.log(req.body);

    try{
        const { email, password, passwordVerify } = req.body;
        //validation 

        if(!email || !password || !passwordVerify)
            return res.status(400).json({errorMessage: "please enter all required fields"});

        if(password.length < 6 )
            return res.status(400).json({errorMessage: "password must be atleast 6 characters long", });

        if(password !== passwordVerify )
             return res.status(400).json({errorMessage: "enter the same password", });

        const existingUser = await User.findOne({email});

        if(existingUser)
            return res.status(400).json({errorMessage: "user already exists",});

        //hash password and salt

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

            // console.log(passwordHash);

        //save new user to the db
        const newUser = new User({
            email, passwordHash
        });
        const savedUser = await newUser.save();

        //sign the tolken   - we will use a JWT to ensure that log in can onnly occur by a user who exists in db
        const token = jwt.sign({
            user: savedUser._id
        } ,process.env.JWT_SECRET);

        // console.log(token);

        //send token in HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
        }).send();

    }catch (err){
        console.error(err);
        res.status(500).send();
    }
    
});

//log in post
router.post("/login", async (req, res) =>{
    try{
        const { email, password } = req.body;

        //validation 

        if(!email || !password )
        return res.status(400).json({errorMessage: "Please enter all required fileds" });

        const existingUser = await User.findOne({email});

        if(!existingUser)
            return res.status(401).json({errorMessage: "Wrong email or password" });

        const passwordCorrect = await bcrypt.compare(password, existingUser.passwordHash);

        if(!passwordCorrect)
            return res.status(401).json({errorMessage: "Wrong email or password" });

        //sign token for logged in user

        //sign the tolken   - we will use a JWT to ensure that log in can onnly occur by a user who exists in db
        const token = jwt.sign({
            user: existingUser._id
        } ,process.env.JWT_SECRET);

        // console.log(token);

        //send token in HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
        }).send();


    }catch{
        console.error(err);
        res.status(500).send();
    }

});

//router for logging a user out

router.get("/logout", (req, res) =>{
    res.cookie("token", "", {

        httpOnly: true,
        expires: new Date(0)

    }).send();
});

// we can then build private endpoits that will be able to be opperable once a user is logged in 

module.exports = router;