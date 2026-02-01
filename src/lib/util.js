import jwt from 'jsonwebtoken';

export const generateToken = (userId ,res ) =>{

    const token = jwt.sign({id:userId}, process.env.JWT_SECRET , {
    expiresIn:"7d"})

    res.cookie("jwt" , token , {
    httpOnly:true,
    maxAge: 7*24*60*60*1000,
    secure: true,
    sameSite: "none",
    });


    return token;

}


export const generateTokenAdmin = (userId ,res ) =>{

    const token = jwt.sign({id:userId}, process.env.JWT_SECRET_ADMIN , {
    expiresIn:"7d"})

    res.cookie("jwt" , token , {
    httpOnly:true,
    maxAge: 7*24*60*60*1000,
    secure: true,
    sameSite: "none",
    });


    return token;

}