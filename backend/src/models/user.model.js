import mongoose from "mongoose";
import bcrypt from 'bcryptjs'



let userSChema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId
        }
    },
    contact: {
        type: String,
        required: function () {
            return !this.googleId
        }
    },
    fullname: {
        type: String,
        required: true
    },
    googleId: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['buyer', 'seller'],
        default: 'buyer'
    },
    recentlyViewed: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products'
        }],
        default: []
    },
    addresses: {
        type: [{
            name: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            },
            street: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            pincode: {
                type: String,
                required: true
            },
            country: {
                type: String,
                required: true,
                default: 'India'
            },
            isDefault: {
                type: Boolean,
                default: false
            }
        }],
        default: []
    }
}
    , { timestamps: true });
userSChema.pre("save", async function () {
    if (!this.password || !this.isModified("password")) return


    let hash = await bcrypt.hash(this.password, 10)
    this.password = hash
})

userSChema.methods.comparePassword = async function (password) {
    if (!this.password) return false
    return await bcrypt.compare(password, this.password)
}



const usermodel = mongoose.model("User", userSChema);

export default usermodel;
