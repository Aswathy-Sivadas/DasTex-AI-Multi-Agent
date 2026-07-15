import { getAuth } from "firebase-admin/auth"
import { app } from "../config/firebase.js"
import User from "../models/user.model.js";
import crypto from "crypto"
import redis from "../../../shared/redis/redis.js"

export const login = async (req, res) => {
    try {
        const { token } = req.body
        const decoded = await getAuth(app).verifyIdToken(token)
        // firebase gives specific uid to all users
        let user = await User.findOne({
            firebaseUid: decoded.uid,
        })
        if (!user) {
            user = await User.create({
                firebaseUid: decoded.uid,
                name: decoded.name,
                email: decoded.email,
                avatar: decoded.picture,
            })
        }
        const sessionId = crypto.randomUUID()
        await redis.set(
            `session-${sessionId}`,
            JSON.stringify({
                userId: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            }),
            "EX",
            7 * 24 * 60 * 60
        )
        res.cookie("session", sessionId, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        return res.status(200).json(user)
    } catch (error) {
        console.error("login error", error)
        return res.status(500).json({ message: `login error ${error.message || error}` })
    }
}



export const logout = async(req,res)=>{
    try{
        const sessionId=req.cookies?.session
        await redis.del(`session-${sessionId}`)

        res.clearCookie("session")
        return res.status(200).json({ message: `logout successful` })
    }catch(error){
        return res.status(500).json({message:`logout error ${error}`})
    }
}