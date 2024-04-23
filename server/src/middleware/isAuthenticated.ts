import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { MyJwtPayload } from "..";

export function isAuthenticated(req: any, res: Response, next: NextFunction) {
  try {
    

    if (req?.session?.user) {
    

      const cookieValue = req?.headers?.cookie.split(";");

      let token;

      cookieValue?.forEach((element: string) => {
        if (element?.trim().startsWith("token")) {
          token = element.split("=")[1];
        }
      });

      

      if (!token) {
        
        console.log("token not available");
        

      return  res.status(401).send("unauthorized");
      }

      if (token) {
        

        const jwtUser = jwt.verify(token, "strongsecrect") as MyJwtPayload;

        if (jwtUser?.user === req.session.user) {
          

          next();
        } else {
          

          return  res.status(401).send("unauthorized");
        }
      }
    } else {
      
      console.log("session not available");
      return  res.status(401).send("unauthorized");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/login");
  }
}
