
const asyncWrapper=require("../middlewares/asyncWrapper");
const User=require("../models/user.schema");
const appError=require('../utils/appError')
const bcrypt=require("bcrypt");
const generateJWT=require("../utils/generateJWT")
const httpStatusText=require("../utils/httpStatusText")

const login=asyncWrapper(async(req,res,next)=>{
    const {userName,password}=req.body;
    if(!userName && !password){
        const error =appError.create("userName and  password are required ",400,httpStatusText.FAIL)
        return next(error)
    }
    const user=  await User.findOne({userName:userName})
    if (!user){
        const error =appError.create("user not found",400,httpStatusText.FAIL)
        return next(error)
    }
    // compare password
    const matchedPassword= await bcrypt.compare(password,user.password)

    if(user&&matchedPassword){
        // logged in  successfully
        const token=await generateJWT({userName:user.userName,id:user._id,role:user.role})
        return res.json({status:httpStatusText.SUCCESS,data:{token}})
    }else{
        const error =appError.create(" something wrong ",500,httpStatusText.FAIL)
        return next(error)
    }
})


const register=asyncWrapper(async(req,res,next)=>{

const {firstName,lastName,userName,password,role,email,phone}=req.body

const oldUser=await User.findOne({userName:userName});

if(oldUser){
    const error = appError.create("user already exists",400,httpStatusText.FAIL)
    return next(error)   
}

// password hashed
const hashedPassword=await bcrypt.hash(password,10)

const newUser= new User({
        firstName,
        lastName,
        userName,
        password:hashedPassword,
        role,
        email,
        phone
    })

// generate jwt token
const token =await generateJWT({userName:newUser.userName,id:newUser._id,role:newUser.role})
newUser.token=token

await newUser.save()

return res.status(201).json({status:httpStatusText.SUCCESS,data:{user:newUser}})

})


module.exports={
register,login
}