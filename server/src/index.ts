import express, { Express, Request, RequestHandler, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

import crypto from "crypto";

import session, { SessionData } from "express-session";
import MySQLStore from "express-mysql-session";

import jwt from "jsonwebtoken";

import path from "path";
import { isAuthenticated } from "./middleware/isAuthenticated";
import { connection, options } from "./db/connection";
import { sendOtp } from "./middleware/sendOtp";

const SqlStore = MySQLStore(session as any);

const sessionStore = new SqlStore(options, connection);

dotenv.config();

const app: Express = express();

app.use(
  session({
    name: "authsession",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    secret: "somesecrect",
    cookie: {
      httpOnly: false,
      //  maxAge: 'TWO_HOURS',
      sameSite: false,
      secure: false,
    },
  })
);

app.use(cors());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 5000;

export interface MyJwtPayload {
  user: string;
}
interface CustomSession extends SessionData {
  user?: string; // Define 'user' property as optional
}



// app.get("/verifyotp", async (req: Request, res: Response) => {
//   try {
//     const otpForm = `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Login</title>
//     </head>
//     <body>
//       <h2>Login</h2>
//       <form action="/verifyotp" method="POST">
        
//         <label for="otp">OTP:</label><br>
//         <input type="text" id="otp" name="otp" required><br><br>
//         <button type="submit">Login</button>
//       </form>
//     </body>
//     </html>
//   `;
//     res.send(otpForm);
//   } catch (error) {
//     console.log(error);
//   }
// });

app.post("/verifyotp", async (req: Request, res: Response) => {
  try {
    const cookieValue = req?.headers?.cookie?.split(";");

    let user;
    let request_id: string | null = null;

    cookieValue?.forEach((element: string) => {
      if (element?.trim().startsWith("user=")) {
        user = element.split("=")[1];
      }

      if (element?.trim().startsWith("request_id=")) {
        request_id = element.split("=")[1];
      }
    });

    if (!user || request_id == null) {
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
          res.clearCookie("user");
          res.clearCookie("request_id");

          return res.redirect("/");
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

// app.get("/login", (req: Request, res: Response) => {
//   const loginForm = `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Login</title>
//     </head>
//     <body>
//       <h2>Login</h2>
//       <form action="/login" method="POST">
//         <label for="email">Email:</label><br>
//         <input type="email" id="email" name="email" required><br>
//         <label for="password">Password:</label><br>
//         <input type="password" id="password" name="password" required><br><br>
//         <button type="submit">Login</button>
//       </form>
//     </body>
//     </html>
//   `;
//   res.send(loginForm);
// });

app.post("/login", async (req: any, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email && !password) {
      return res.send("please provide email and password");
    }

    const salt = "54564adhbhkljglkj54a6dsjhgd466asdjdhgjha";
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

          // console.log(messages.sid);
          res.cookie("user", user.id, { httpOnly: true, secure: true });
          res.cookie("request_id", messages.sid, {
            httpOnly: true,
            secure: true,
          });

          return res.status(200).send("OTP send seccessfully successful");
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
    const salt = "54564adhbhkljglkj54a6dsjhgd466asdjdhgjha";
    const hash = crypto.createHmac("sha512", salt).update(password);

    const hashpassword = hash.digest("hex");

    connection.query(
      "INSERT INTO user (fullname,email,username,password,mobile) VALUES (?,?,?,?,?)",
      [fullname, email, username, hashpassword, mobile]
    );

    res.send("User created");
  } catch (error) {
    res.send(error);
  }
});

app.use(express.static(path.join(__dirname, "../../client/dist")));

app.get("*", function (req: any, res: Response) {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
