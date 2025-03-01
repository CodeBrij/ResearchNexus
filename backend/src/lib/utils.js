import jwt from "jsonwebtoken";

//gen. token function and storing in cookie
//parameters = id for token and res for storing in cookie
export const generateTokens = (userId, res) => {
  //creating token named as jwt - using secret key from env file
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  //storing in cookie
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, //in ms
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "strict", // csrf attacks cross site request forgery attacks
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};
