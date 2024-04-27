import express, { Express, Request, RequestHandler, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
// import cors from "cors";
import * as OTPAuth from "otpauth";

import crypto from "crypto";

import session, { SessionData } from "express-session";
import MySQLStore from "express-mysql-session";

import jwt from "jsonwebtoken";

import path from "path";

import { connection, options } from "./db/connection";
import { sendOtp } from "./middleware/sendOtp";
import { isAuthenticated } from "./middleware/isAuthenticated";
import { FieldPacket, RowDataPacket } from "mysql2";
import { differenceInSeconds } from "date-fns";
import QRCode from "qrcode"
import { v4 as uuidv4 } from 'uuid';


const SqlStore = MySQLStore(session as any);

// const secrectHex=crypto.randomBytes(48).toString('hex')

// const secrect=OTPAuth.Secret.fromHex(secrectHex)




// let totp = new OTPAuth.TOTP({
//   issuer: "Auth",
//   label: "Authapp",
//   algorithm: "SHA1",
//   digits: 6,
//   period: 60,
//   secret: secrect, // or 'OTPAuth.Secret.fromBase32("NB2W45DFOIZA")'
// });




// let uri = totp.toString();

// QRCode.toString(uri,{type:"terminal"},(err,data)=>{
//   console.log(data);
  
// })


// const delta =totp.validate({token:"",window:1})

const newLocal = "X";
function maskPhoneNumber(phoneNumber: string) {
  const masked = newLocal.repeat(phoneNumber.length - 2) + phoneNumber.slice(-2);
  return masked;
}

const sessionStore = new SqlStore(options);

const app: Express = express();

// app.use(express.json());

// app.use(cors());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 5000;

export interface MyJwtPayload {
  user: string;
}
interface CustomSession extends SessionData {
  user?: string; // Define 'user' property as optional
  created_at?: Date;
}

app.use(
  session({
    name: "authsession",
    resave: true,
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
    const { request_id, user, otp,type } = req.body;
    console.log(type);
    

    if (!user || !request_id || !otp) {
      return res
        .status(400)
        .json({ message: "user or request id not available" });
    }

    const [userRows, userFields]: [RowDataPacket[], FieldPacket[]] =
      await connection.query("SELECT * from user where id=?", [user]);

    if (!userRows || userRows?.length == 0) {
      return res.status(400).json({ message: "user not found" });
    }

    const databaseUser = userRows[0];

    if(databaseUser.totp_active && (databaseUser.request_id==request_id) && type=='true'){
      console.log(databaseUser.totp_key);
      
      const totp = new OTPAuth.TOTP({
        issuer: "Auth",
        label: "Authapp",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: databaseUser.totp_key, 
      });

      
      
  

//       let uri = totp.toString();

// QRCode.toString(uri,{type:"terminal"},(err,data)=>{
//   console.log(data);
  
// })

      
      
      // const delta =totp.validate({token:otp,window:1})

      // console.log(delta);
      
      
      

      if(totp.generate()==otp){
        console.log("in delta");
        
        const [sessionRows, sessionFields]: [RowDataPacket[], FieldPacket[]] =
        await connection.query(
          `SELECT * FROM sessions WHERE JSON_EXTRACT(user, '$.user') = ${user};`
          // [user]
        );

      for (let i = 0; i < sessionRows?.length; i++) {
        try {
          const element = sessionRows[i];
          await connection.query("DELETE FROM sessions WHERE session_id = ? ", [
            element.session_id,
          ]);
        } catch (error) {
          return res.status(400).json({message:"Something went wrong11"});
        }
      }

      if (req?.session) {
        // console.log("no sessios");
        
        (req.session as CustomSession).user = databaseUser.id;
        (req.session as CustomSession).created_at = new Date();
      }else{
        return res.status(400).json({message:"Something went wrong111"});
      }

      const token = jwt.sign({ user: databaseUser.id }, "strongsecrect");

      res.cookie("token", token, { httpOnly: true, secure: true });

      return res.status(201).json({ message: "Login successfully" });
      }else{
        return res.status(400).json({message:"Something went wrong555"});
      }

      

    }



    const result = differenceInSeconds(
      new Date(),
      new Date(databaseUser?.otp_expiry)
    );

    if (result > 120) {
      return res.status(400).json({ message: "OTP expire" });
    }

    if (databaseUser.request_id === request_id && databaseUser.otp === otp) {
      const [sessionRows, sessionFields]: [RowDataPacket[], FieldPacket[]] =
        await connection.query(
          `SELECT * FROM sessions WHERE JSON_EXTRACT(user, '$.user') = ${user};`
          // [user]
        );

      for (let i = 0; i < sessionRows?.length; i++) {
        try {
          const element = sessionRows[i];
          await connection.query("DELETE FROM sessions WHERE session_id = ? ", [
            element.session_id,
          ]);
        } catch (error) {
          return res.status(400).send("Something went wrong");
        }
      }

      if (req?.session) {
        (req.session as CustomSession).user = databaseUser.id;
        (req.session as CustomSession).created_at = new Date();
      }else{
        return res.status(400).send("Something went wrong");
      }

      const token = jwt.sign({ user: databaseUser.id }, "strongsecrect");

      res.cookie("token", token, { httpOnly: true, secure: true });

      return res.status(201).json({ message: "Login successfully" });
    } else {
      return res.status(400).json({ message: "Wrong otp" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/resetotpverify", async (req: Request, res: Response) => {
  try {
    const { request_id, user, otp } = req.body;

    if (!user || !request_id || !otp) {
      return res
        .status(400)
        .json({ message: "user or request id not available" });
    }

    const [userRows, userFields]: [RowDataPacket[], FieldPacket[]] =
      await connection.query("SELECT * from user where id=?", [user]);

    if (!userRows || userRows?.length == 0) {
      return res.status(400).json({ message: "user not found" });
    }

    const databaseUser = userRows[0];

    if (databaseUser.request_id === request_id && databaseUser.otp === otp) {
      const token = jwt.sign({ user: databaseUser.id }, "strongsecrect");

      res.cookie("token", token, { httpOnly: true, secure: true });

      return res.status(201).json({ message: "OTP verified" });
    } else {
      return res.status(400).json({ message: "Wrong otp" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/passwordreset", async (req, res) => {
  try {
    const { otp, request_id, password, email } = req.body;
    const [rows, fields]: [RowDataPacket[], FieldPacket[]] =
      await connection.query("SELECT * FROM user WHERE email = ?", [email]);

    const user = rows?.[0];

    const cookieValue = req?.headers?.cookie?.split(";");

    let token;

    cookieValue?.forEach((element: string) => {
      if (element?.trim().startsWith("token")) {
        token = element.split("=")[1];
      }
    });

    // token is not set
    if (!token)
      return res.status(400).json({ message: "Something went wrong" });

    const jwtUser = jwt.verify(token, "strongsecrect") as MyJwtPayload;

    if (jwtUser.user != user.id)
      return res
        .status(400)
        .json({ message: "Something went wrong not same user" });

    const salt = process.env.JWT_SECRECT as string;
    const hash = crypto.createHmac("sha512", salt).update(password);

    const hashpassword = hash.digest("hex");

    if (
      user.otp === otp &&
      user.request_id === request_id &&
      email === user.email
    ) {
      const [rows, fields]: [RowDataPacket[], FieldPacket[]] =
        await connection.query("UPDATE  user set password = ? where id = ?", [
          hashpassword,
          user.id,
        ]);
    }

    return res.status(201).send({ message: "Password update successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/resetpassword", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const [rows, fields]: [RowDataPacket[], FieldPacket[]] =
      await connection.query(
        "SELECT id, email, otp_expiry, mobile FROM user WHERE email = ?",
        [email]
      );

    const user = rows?.[0];

    const response = await sendOtp(user.mobile);

    if (response) {
      const { otp, messages } = response;
      await connection.query(
        "UPDATE user SET otp=?, otp_expiry = NOW() + INTERVAL 1 MINUTE , request_id=?  where id= ?",
        [otp, messages?.sid, user?.id]
      );

      return res.status(201).json({
        request_id: messages.sid,
        user: user?.id,
        mobile: maskPhoneNumber(user.mobile),
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/resendotp", async (req: Request, res: Response) => {
  try {
    const { user, request_id } = req.body;

    if (!user || !request_id) {
      return res
        .status(400)
        .json({ message: "Please provide user and request id" });
    }

    const [rows, fields]: [RowDataPacket[], FieldPacket[]] =
      await connection.query(
        "SELECT id, email, otp_expiry, mobile FROM user WHERE id = ? AND request_id = ?",
        [user, request_id]
      );

    const result = differenceInSeconds(
      new Date().toLocaleString(undefined, { timeZone: "Asia/Kolkata" }),
      new Date(rows[0]?.otp_expiry).toLocaleString(undefined, {
        timeZone: "Asia/Kolkata",
      })
    );

    if (result <= 60) {
      return res.status(400).json({ message: "Please wait sometime" });
    }

    if (result > 300) {
      return res.status(400).json({ message: "OTP expire please login again" });
    }

    const response = await sendOtp(rows?.[0]?.mobile);

    if (response) {
      const { otp, messages } = response;
      await connection.query(
        "UPDATE user SET otp=?, otp_expiry = NOW() + INTERVAL 1 MINUTE , request_id=?  where id= ?",
        [otp, messages?.sid, rows[0]?.id]
      );

      return res
        .status(201)
        .json({ request_id: messages.sid, user: rows[0]?.id });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/login", async (req: any, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email && !password) {
      return res
        .status(400)
        .json({ message: "please provide email and password" });
    }
    
    const salt = process.env.JWT_SECRECT as string;
    const hash = crypto.createHmac("sha512", salt).update(password);

    const hashpassword = hash.digest("hex");

    const [rows, fields]: [RowDataPacket[], FieldPacket[]] =
      await connection.query(
        "SELECT id, email, password,mobile, totp_active FROM user WHERE email = ?",
        [email]
      );

    const user = rows?.[0];

    if (hashpassword !== user?.password || !user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    let response;

    if(user.totp_active){
      

        response={
          otp:"TOTP",
          messages:{
            sid:uuidv4()
          }
        }

      // return res.status(201).json({ request_id: secrect.base32, user: user?.id });
    }else{
      response = await sendOtp(user.mobile);
    }


    

    if (response) {
      const { otp, messages } = response;
      await connection.query(
        "UPDATE user SET otp=?, otp_expiry = NOW() + INTERVAL 1 MINUTE , request_id=?  where id= ?",
        [otp, messages?.sid, user?.id]
      );

      return res.status(201).json({ request_id: messages.sid, user: user?.id ,totp_status:user.totp_active==1?true:false});
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/signup", async (req: Request, res: Response) => {
  try {
    const { fullname, email, username, password, mobile } = req.body;
    const salt = process.env.JWT_SECRECT as string;
    const hash = crypto.createHmac("sha512", salt).update(password);

    const hashpassword = hash.digest("hex");

    await connection.query(
      "INSERT INTO user (fullname,email,username,password,mobile) VALUES (?,?,?,?,?)",
      [fullname, email, username, hashpassword, mobile]
    );

    return res.status(201).json({ message: "User created" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/logout", isAuthenticated, async (req: Request, res: Response) => {
  try {
    req.session.destroy(function (err) {
      res.clearCookie("token");
      return res.status(200).send("logout seccesssfully");
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/user", isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (req.session) {
      const [rows, fields]: [RowDataPacket[], FieldPacket[]] =
        await connection.query(
          "SELECT id, email, username,fullname FROM user WHERE id = ?",
          [(req.session as CustomSession)?.user]
        );

      if (rows && rows.length > 0) {
        return res.status(200).json(rows[0]);
      } else {
        return res.status(400).json({ messge: "something went wrong" });
      }
    } else {
      return res.status(401).send("unauthorized");
    }
  } catch (error) {
    console.log(error);
  }
});

app.use(express.static(path.join(__dirname, "../../client/dist")));

app.get("*", function (req: any, res: Response) {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
