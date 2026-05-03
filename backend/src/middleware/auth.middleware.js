import jwt from "jsonwebtoken";
import config from "../config/config.js";
import usermodel from "../models/user.model.js";

const authCookieOptions = {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    path: "/",
}

const unauthorized = (res, message = "Unauthorized") => {
    res.clearCookie('token', authCookieOptions)
    return res.status(401).json({ success: false, message, data: {} })
}

export const authenticateUser = async (req, res, next) => {
    const token = req.cookies.token

    if (!token) {
        return unauthorized(res)
    }

    try {

        const decoded = jwt.verify(token, config.JWT_SECRET)

        const user = await usermodel.findById(decoded.id)

        if (!user) {
            return unauthorized(res)
        }

        req.user = user
        next()

    } catch (err) {
        console.log(err)
        return unauthorized(res, 'Session expired or invalid token')
    }
}


export const authenticateSeller = async (req, res, next) => {
    const token = req.cookies.token

    if (!token) {
        return unauthorized(res)
    }

    try {

        const decoded = jwt.verify(token, config.JWT_SECRET)

        const user = await usermodel.findById(decoded.id)

        if (!user) {
            return unauthorized(res)
        }

        if (user.role !== "seller") {
            return res.status(403).json({ success: false, message: "Forbidden", data: {} })
        }

        req.user = user
        next()

    } catch (err) {
        console.log(err)
        return unauthorized(res, 'Session expired or invalid token')
    }
}