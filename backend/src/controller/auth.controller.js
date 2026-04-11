import bcryptjs from 'bcryptjs'
import usermodel from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import config from '../config/config.js'
import cookie from 'cookie-parser'


let sendtokenresponse  = (user,res,message)=>{
    let token =jwt.sign({id:user._id},config.JWT_SECRET,{expiresIn:"1h"})

    res.cookie("token",token)
    res.status(200).json({
        message,
        success:true,
        token,
        id:user._id,
        email:user.email,
        contact:user.contact,
        fullname:user.fullname,
        role:user.role
    })
}
export let registercontroller = async (req,res)=> {

    let {email,contact,password,fullname} = req.body
    try {
        let existinguser = await usermodel.findOne({
            $or:[
                {email},
                {contact}
            ]
        })

        if(existinguser){
            return res.status(400).json({message:"user with this email or contact already exists"})
        }

        let user = await usermodel.create({
            email,
            contact,
            password,
            fullname,
            role:isSeller?"seller":"buyer"
        })
        await sendtokenresponse(user,res,"user registered successfully")

    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal server error"}   )
    }

}

