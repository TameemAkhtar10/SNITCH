import bcryptjs from 'bcryptjs'
import usermodel from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import config from '../config/config.js'

const authCookieOptions = {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    path: "/",
}


let sendtokenresponse = (user, res, message) => {
    let token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "1h" })

    res.cookie("token", token, {
        ...authCookieOptions,
        maxAge: 1 * 60 * 60 * 1000
    })
    const responseUser = {
        id: user._id,
        email: user.email,
        contact: user.contact,
        fullname: user.fullname,
        role: user.role
    }
    res.status(200).json({
        success: true,
        message,
        token,
        user: responseUser,
        data: { user: responseUser, token }
    })
}
export let registercontroller = async (req, res) => {

    let { email, contact, password, fullname, isSeller } = req.body
    try {
        let existinguser = await usermodel.findOne({
            $or: [
                { email },
                { contact }
            ]
        })

        if (existinguser) {
            return res.status(400).json({ success: false, message: "user with this email or contact already exists", data: {} })
        }

        let user = await usermodel.create({
            email,
            contact,
            password,
            fullname,
            role: isSeller ? "seller" : "buyer"
        })
        await sendtokenresponse(user, res, "user registered successfully")

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "Internal server error", data: {} })
    }

}

export let logincontroller = async (req, res) => {
    let { email, password } = req.body
    try {
        let user = await usermodel.findOne({ email })
        if (!user) {
            return res.status(400).json({ success: false, message: "invalid email or password", data: {} })
        }
        if (!user.password) {
            return res.status(400).json({ success: false, message: "Please continue with Google for this account", data: {} })
        }
        let ismatch = await bcryptjs.compare(password, user.password)
        if (!ismatch) {
            return res.status(400).json({ success: false, message: "invalid email or password", data: {} })
        }
        await sendtokenresponse(user, res, "user logged in successfully")

    }


    catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "Internal server error", data: {} })
    }
}
export const googleCallback = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Google authentication failed', data: {} })
        }

        const { id, displayName, emails } = req.user
        const email = emails?.[0]?.value

        if (!email) {
            return res.status(400).json({ success: false, message: 'Google account email not available', data: {} })
        }

        let user = await usermodel.findOne({ email })

        if (!user) {
            user = await usermodel.create({
                email,
                googleId: id,
                fullname: displayName || 'Google User'
            })
        } else if (!user.googleId) {
            user.googleId = id
            await user.save()
        }

        const token = jwt.sign({
            id: user._id,
        }, config.JWT_SECRET, {
            expiresIn: "7d"
        })

        res.cookie("token", token, {
            ...authCookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const redirectTo = req.query.state || '/home'
        return res.redirect(`http://localhost:5173/auth/google/success?token=${token}&redirectTo=${encodeURIComponent(redirectTo)}`);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} })
    }
}
export const getmecontroller = async (req, res) => {
    try {
        const user = await usermodel.findById(req.user._id).select("-password -googleId -__v")
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found", data: {} })
        }
        return res.status(200).json({ success: true, message: "User fetched successfully", user, data: { user } })
    } catch (error) {

        console.log(error)
        return res.status(500).json({ success: false, message: "Internal server error", data: {} })
    }
}

export const logoutcontroller = async (req, res) => {
    try {
        res.clearCookie('token', authCookieOptions)
        return res.status(200).json({ success: true, message: 'Logged out successfully', data: {} })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} })
    }
}


