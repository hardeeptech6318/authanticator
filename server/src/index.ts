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
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { verifytotp } from "./lib/verifyotp";
import { deleteSessions } from "./lib/deleteSessions";
import helmet from "helmet";

const SqlStore = MySQLStore(session as any);

const newLocal = "X";
function maskPhoneNumber(phoneNumber: string) {
  const masked =
    newLocal.repeat(phoneNumber.length - 2) + phoneNumber.slice(-2);
  return masked;
}

const sessionStore = new SqlStore(options);

const app: Express = express();
app.use(helmet());


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

app.post("/signup", async (req: Request, res: Response) => {
  try {
    const { fullname, email, username, password, mobile } = req.body;

    const [rows, fields]: [RowDataPacket[], FieldPacket[]] =
      await connection.query("SELECT email FROM user WHERE email = ?", [email]);

    if (rows.length > 0) {
      return res
        .status(400)
        .json({ message: "User already exist please login" });
    }

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

app.post("/login", async (req: any, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email && !password) {
      return res
        .status(400)
        .json({ message: "please provide valid email and password" });
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

    if (user.totp_active == 1) {
      response = {
        otp: null,
        messages: {
          sid: uuidv4(),
        },
      };

      // return res.status(201).json({ request_id: secrect.base32, user: user?.id });
    } else {
      response = await sendOtp(user.mobile);
    }

    if (response) {
      const { otp, messages } = response;
      await connection.query(
        "UPDATE user SET otp=?, otp_expiry = NOW() + INTERVAL 1 MINUTE , request_id=?  where id= ?",
        [otp, messages?.sid, user?.id]
      );

      return res
        .status(201)
        .json({
          request_id: messages.sid,
          user: user?.id,
          totp_status: user.totp_active == 1 ? true : false,
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

app.post("/verifyotp", async (req: Request, res: Response) => {
  try {
    const { request_id, user, otp, type } = req.body;

    if (!user || !request_id || !otp) {
      return res.status(400).json({ message: "user or request id not available" });
    }

    const [userRows, userFields]: [RowDataPacket[], FieldPacket[]] =
      await connection.query("SELECT * from user where id=?", [user]);

    if (!userRows || userRows?.length == 0) {
      return res.status(400).json({ message: "user not found" });
    }

    const databaseUser = userRows[0];

    let veriftOTP;

    if (type == "true" && databaseUser.totp_active) {
      veriftOTP = await verifytotp(otp, databaseUser.totp_key);
      return res.status(400).json({ message: "TOTP wrong" });

    } else {
      veriftOTP = databaseUser.otp == otp;

      const result = differenceInSeconds(
        new Date(),
        new Date(databaseUser?.otp_expiry)
      );

      if (result > 120) {
        return res.status(400).json({ message: "OTP expire" });
      }
    }

    if (!veriftOTP && !(databaseUser.request_id === request_id)) {
      return res.status(400).json({ message: "Wrong otp" });
    }

    if(!req.session){
      return res.status(400).send("Something went wrong");
    }

    await deleteSessions(user);

    
      (req.session as CustomSession).user = databaseUser.id;
      (req.session as CustomSession).created_at = new Date();
    

    const token = jwt.sign({ user: databaseUser.id }, "strongsecrect");

    res.cookie("token", token, { httpOnly: true, secure: true });

    return res.status(201).json({ message: "Login successfully" });
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

app.post("/totpactivate", isAuthenticated, async (req, res) => {
  try {
    const { totp_active } = req.body;

    const [rows, fields]: [RowDataPacket[], FieldPacket[]] =
      await connection.query("SELECT * from user where id = ?", [
        (req.session as CustomSession)?.user,
      ]);
    const user = rows[0];
    let secrect;

    if (user.totp_key) {
      secrect = user.totp_key;
    } else {
      const secrectHex = crypto.randomBytes(48).toString("hex");

      secrect = OTPAuth.Secret.fromHex(secrectHex).base32;
    }

    await connection.query(
      "UPDATE user SET totp_key =? ,totp_active = ? where id = ?",
      [
        secrect,
        totp_active === "true" ? 1 : 0,
        (req.session as CustomSession)?.user,
      ]
    );

    let totp = new OTPAuth.TOTP({
      issuer: "Auth",
      label: "Authapp",
      algorithm: "SHA1",
      digits: 6,
      period: 60,
      secret: secrect, // or 'OTPAuth.Secret.fromBase32("NB2W45DFOIZA")'
    });

    let uri = totp.toString();

    const qrimage = await QRCode.toDataURL(uri);

    return res.status(201).json({ qrimage: qrimage, code: secrect });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

app.get("/api/user", isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (req.session) {
      const [rows, fields]: [RowDataPacket[], FieldPacket[]] =
        await connection.query(
          "SELECT id, email, username,fullname,totp_active FROM user WHERE id = ?",
          [(req.session as CustomSession)?.user]
        );

        rows[0].totp_active=rows[0].totp_active==1?true:false

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
