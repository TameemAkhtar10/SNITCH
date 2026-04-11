import mongoose  from "mongoose";
import bcrypt from 'bcryptjs'



let userSChema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },  
    contact: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['buyer', 'seller'],
        default: 'buyer'
    }
})
userSChema.pre("save",async function(){
    if(!this.isModified("password")) return 


    let hash = await bcrypt.hash(this.password,10)
    this.password = hash    
})

userSChema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password)
}



const usermodel = mongoose.model("User", userSChema);

export default usermodel;
