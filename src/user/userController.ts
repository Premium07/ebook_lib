import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModal from "./userModal";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";

const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, email, password } = req.body;
  // validation
  if (!username || !email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }
  // Database call
  try {
    const user = await userModal.findOne({ email });
    if (user) {
      const error = createHttpError(400, `User already exits with this email`);
      return next(error);
    }
  } catch (error) {
    return next(createHttpError(500, "Error while getting user"));
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  let newUser: User;
  try {
    newUser = await userModal.create({
      username,
      email,
      password: hashedPassword,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while creating user."));
  }

  try {
    // token generation with JWT
    const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });

    // response
    res.json({ accessToken: token });
  } catch (error) {
    return next(createHttpError(500, "Error while signing JWT token"));
  }
};

export { registerUser };
