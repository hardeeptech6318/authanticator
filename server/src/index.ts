import express, { Express, Request, RequestHandler, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

import crypto from "crypto";

import session, { SessionData } from "express-session";
import MySQLStore from "express-mysql-session";

import jwt from "jsonwebtoken";

import path from "path";

import { connection, options } from "./db/connection";
import { sendOtp } from "./middleware/sendOtp";
import { isAuthenticated } from "./middleware/isAuthenticated";

const SqlStore = MySQLStore(session as any);

const sessionStore = new SqlStore(options, connection);

const app: Express = express();

// app.use(express.json());



app.use(cors());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 5000;

export interface MyJwtPayload {
  user: string;
}
interface CustomSession extends SessionData {
  user?: string; // Define 'user' property as optional
}


app.use(
  session({
    name: "authsession",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    secret: process.env.AUTH_SESSION_SECRECT as string,
    cookie: {
      httpOnly: false,
      //  maxAge: 50000000,
      // sameSite: false,
      secure: false,
    },
  })
);

app.post("/verifyotp", async (req: Request, res: Response) => {
  try {
    let user = 8;

    const { request_id } = req.body;

    if (!user || !request_id) {
      return res.status(400).send("user or request id not available");
    }

    connection.query(
      "SELECT * from user where id=?",
      [user],
      async function (err, results: any, fields) {
        if (!results || results.length == 0) {
          return res.status(400).send("user not found");
        }

        const databaseUser = results[0];

        if (
          databaseUser.request_id === request_id &&
          databaseUser.otp === req.body.otp
        ) {
          if (req.session) {
            (req.session as CustomSession).user = databaseUser.id;
          }

          const token = jwt.sign({ user: databaseUser.id }, "strongsecrect");

          res.cookie("token", token, { httpOnly: true, secure: true });

          return res.status(201).send("seccess");
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req: any, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email && !password) {
      return res.send("please provide email and password");
    }

    const salt = process.env.JWT_SECRECT as string;
    const hash = crypto.createHmac("sha512", salt).update(password);

    const hashpassword = hash.digest("hex");  

    connection?.query(
      "SELECT id, email, password,mobile FROM user WHERE email = ?",
      [email],
      async function (err, results: any, fields) {
        if (err) {
          return res.status(500).send("Internal Server Error");
        }

        const user = results[0];

        if (!user) {
          return res.status(401).send("Invalid email or password");
        }

        if (hashpassword !== user.password) {
          return res.status(401).send("Invalid email or password");
        }

        const response = await sendOtp(user.mobile);

        if (response) {
          const { otp, messages } = response;
          connection.query(
            "UPDATE user SET otp=?, otp_expiry = NOW() + INTERVAL 1 MINUTE , request_id=?  where id= ?",
            [otp, messages?.sid, user?.id]
          );

          return res.status(201).json({ request_id: messages.sid });
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.post("/signup", async (req: Request, res: Response) => {
  try {
    const { fullname, email, username, password, mobile } = req.body;
    const salt = process.env.JWT_SECRECT as string;
    const hash = crypto.createHmac("sha512", salt).update(password);

    const hashpassword = hash.digest("hex");

    connection.query(
      "INSERT INTO user (fullname,email,username,password,mobile) VALUES (?,?,?,?,?)",
      [fullname, email, username, hashpassword, mobile]
    );

    res.send("User created");
  } catch (error) {
    console.log(error);

    res.send(error);
  }
});


app.get("/api/user",isAuthenticated,async(req:Request,res:Response)=>{
  try {

    if(req.session ){
     connection?.query(
        "SELECT id, email, password,mobile FROM user WHERE id = ?",
        [(req.session as CustomSession)?.user],async function (err, results: any, fields) {
          if(err) return res.status(400).send("Something went wrong")
          return res.status(200).json(results[0])
        })
    } else{
      return res.status(401).send("unauthorized")
    }
    
  } catch (error) {
    console.log(error);
    
  }
})

app.use(express.static(path.join(__dirname, "../../client/dist")));

app.get("*", function (req: any, res: Response) {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
