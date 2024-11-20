import { NextFunction, Request, Response } from "express";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const {title, description, genre, author} = req.body;
  
  res.json({ message: "OK" });
};

export { createBook };
