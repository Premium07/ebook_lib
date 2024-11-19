import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModal from "./userModal";

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
  const user = await userModal.findOne({ email });

  if (user) {
    const error = createHttpError(400, `User already exits with this email`);
    return next(error);

    // process
    
  }
  res.json({ messgae: "user registered" });
};

export { registerUser };
