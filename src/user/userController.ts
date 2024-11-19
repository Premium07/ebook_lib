import { NextFunction, Request, Response } from "express";

const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.json({ messgae: "user registered" });
};

export { registerUser };
