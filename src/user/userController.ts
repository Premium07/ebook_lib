import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

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

    // process
  }
  res.json({ messgae: "user registered" });
};

export { registerUser };
