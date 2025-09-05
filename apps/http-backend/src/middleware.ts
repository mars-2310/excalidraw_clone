import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
//import { JWT_SECRET } from "@repo/backend-common/config";
const JWT_SECRET = "123ger4tg!f4@@";

export function middleware(req: Request, res: Response, next: NextFunction) {

    const token = req.headers["authorization"];

    const decoded = jwt.verify(token as string, JWT_SECRET);

    if(decoded) {
     
      req.userId = (decoded as JwtPayload).userId;
      next();
    } else {
      res.json({
        message: "Unauthorized"
      });
    }
}