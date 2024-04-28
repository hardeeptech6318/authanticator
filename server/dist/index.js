"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// import cors from "cors";
const OTPAuth = __importStar(require("otpauth"));
const crypto_1 = __importDefault(require("crypto"));
const express_session_1 = __importDefault(require("express-session"));
const express_mysql_session_1 = __importDefault(require("express-mysql-session"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const connection_1 = require("./db/connection");
const sendOtp_1 = require("./middleware/sendOtp");
const isAuthenticated_1 = require("./middleware/isAuthenticated");
const date_fns_1 = require("date-fns");
const qrcode_1 = __importDefault(require("qrcode"));
const uuid_1 = require("uuid");
const verifyotp_1 = require("./lib/verifyotp");
const deleteSessions_1 = require("./lib/deleteSessions");
const helmet_1 = __importDefault(require("helmet"));
const SqlStore = (0, express_mysql_session_1.default)(express_session_1.default);
const newLocal = "X";
function maskPhoneNumber(phoneNumber) {
    const masked = newLocal.repeat(phoneNumber.length - 2) + phoneNumber.slice(-2);
    return masked;
}
const sessionStore = new SqlStore(connection_1.options);
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
const port = process.env.PORT || 5000;
app.use((0, express_session_1.default)({
    name: "authsession",
    resave: true,
    saveUninitialized: false,
    store: sessionStore,
    secret: process.env.AUTH_SESSION_SECRECT,
    cookie: {
        httpOnly: false,
        //  maxAge: 50000000,
        // sameSite: false,
        secure: false,
    },
}));
app.post("/signup", async (req, res) => {
    try {
        const { fullname, email, username, password, mobile } = req.body;
        const [rows, fields] = await connection_1.connection.query("SELECT email FROM user WHERE email = ?", [email]);
        if (rows.length > 0) {
            return res
                .status(400)
                .json({ message: "User already exist please login" });
        }
        const salt = process.env.JWT_SECRECT;
        const hash = crypto_1.default.createHmac("sha512", salt).update(password);
        const hashpassword = hash.digest("hex");
        await connection_1.connection.query("INSERT INTO user (fullname,email,username,password,mobile) VALUES (?,?,?,?,?)", [fullname, email, username, hashpassword, mobile]);
        return res.status(201).json({ message: "User created" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
});
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email && !password) {
            return res
                .status(400)
                .json({ message: "please provide valid email and password" });
        }
        const salt = process.env.JWT_SECRECT;
        const hash = crypto_1.default.createHmac("sha512", salt).update(password);
        const hashpassword = hash.digest("hex");
        const [rows, fields] = await connection_1.connection.query("SELECT id, email, password,mobile, totp_active FROM user WHERE email = ?", [email]);
        const user = rows?.[0];
        if (hashpassword !== user?.password || !user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        let response;
        if (user.totp_active == 1) {
            response = {
                otp: null,
                messages: {
                    sid: (0, uuid_1.v4)(),
                },
            };
            // return res.status(201).json({ request_id: secrect.base32, user: user?.id });
        }
        else {
            response = await (0, sendOtp_1.sendOtp)(user.mobile);
        }
        if (response) {
            const { otp, messages } = response;
            await connection_1.connection.query("UPDATE user SET otp=?, otp_expiry = NOW() + INTERVAL 1 MINUTE , request_id=?  where id= ?", [otp, messages?.sid, user?.id]);
            return res
                .status(201)
                .json({
                request_id: messages.sid,
                user: user?.id,
                totp_status: user.totp_active == 1 ? true : false,
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
});
app.post("/resendotp", async (req, res) => {
    try {
        const { user, request_id } = req.body;
        if (!user || !request_id) {
            return res
                .status(400)
                .json({ message: "Please provide user and request id" });
        }
        const [rows, fields] = await connection_1.connection.query("SELECT id, email, otp_expiry, mobile FROM user WHERE id = ? AND request_id = ?", [user, request_id]);
        const result = (0, date_fns_1.differenceInSeconds)(new Date().toLocaleString(undefined, { timeZone: "Asia/Kolkata" }), new Date(rows[0]?.otp_expiry).toLocaleString(undefined, {
            timeZone: "Asia/Kolkata",
        }));
        if (result <= 60) {
            return res.status(400).json({ message: "Please wait sometime" });
        }
        if (result > 300) {
            return res.status(400).json({ message: "OTP expire please login again" });
        }
        const response = await (0, sendOtp_1.sendOtp)(rows?.[0]?.mobile);
        if (response) {
            const { otp, messages } = response;
            await connection_1.connection.query("UPDATE user SET otp=?, otp_expiry = NOW() + INTERVAL 1 MINUTE , request_id=?  where id= ?", [otp, messages?.sid, rows[0]?.id]);
            return res
                .status(201)
                .json({ request_id: messages.sid, user: rows[0]?.id });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
});
app.post("/verifyotp", async (req, res) => {
    try {
        const { request_id, user, otp, type } = req.body;
        if (!user || !request_id || !otp) {
            return res.status(400).json({ message: "user or request id not available" });
        }
        const [userRows, userFields] = await connection_1.connection.query("SELECT * from user where id=?", [user]);
        if (!userRows || userRows?.length == 0) {
            return res.status(400).json({ message: "user not found" });
        }
        const databaseUser = userRows[0];
        let veriftOTP;
        if (type == "true" && databaseUser.totp_active) {
            veriftOTP = await (0, verifyotp_1.verifytotp)(otp, databaseUser.totp_key);
            return res.status(400).json({ message: "TOTP wrong" });
        }
        else {
            veriftOTP = databaseUser.otp == otp;
            const result = (0, date_fns_1.differenceInSeconds)(new Date(), new Date(databaseUser?.otp_expiry));
            if (result > 120) {
                return res.status(400).json({ message: "OTP expire" });
            }
        }
        if (!veriftOTP && !(databaseUser.request_id === request_id)) {
            return res.status(400).json({ message: "Wrong otp" });
        }
        if (!req.session) {
            return res.status(400).send("Something went wrong");
        }
        await (0, deleteSessions_1.deleteSessions)(user);
        req.session.user = databaseUser.id;
        req.session.created_at = new Date();
        const token = jsonwebtoken_1.default.sign({ user: databaseUser.id }, "strongsecrect");
        res.cookie("token", token, { httpOnly: true, secure: true });
        return res.status(201).json({ message: "Login successfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
});
app.post("/resetotpverify", async (req, res) => {
    try {
        const { request_id, user, otp } = req.body;
        if (!user || !request_id || !otp) {
            return res
                .status(400)
                .json({ message: "user or request id not available" });
        }
        const [userRows, userFields] = await connection_1.connection.query("SELECT * from user where id=?", [user]);
        if (!userRows || userRows?.length == 0) {
            return res.status(400).json({ message: "user not found" });
        }
        const databaseUser = userRows[0];
        if (databaseUser.request_id === request_id && databaseUser.otp === otp) {
            const token = jsonwebtoken_1.default.sign({ user: databaseUser.id }, "strongsecrect");
            res.cookie("token", token, { httpOnly: true, secure: true });
            return res.status(201).json({ message: "OTP verified" });
        }
        else {
            return res.status(400).json({ message: "Wrong otp" });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
});
app.post("/passwordreset", async (req, res) => {
    try {
        const { otp, request_id, password, email } = req.body;
        const [rows, fields] = await connection_1.connection.query("SELECT * FROM user WHERE email = ?", [email]);
        const user = rows?.[0];
        const cookieValue = req?.headers?.cookie?.split(";");
        let token;
        cookieValue?.forEach((element) => {
            if (element?.trim().startsWith("token")) {
                token = element.split("=")[1];
            }
        });
        // token is not set
        if (!token)
            return res.status(400).json({ message: "Something went wrong" });
        const jwtUser = jsonwebtoken_1.default.verify(token, "strongsecrect");
        if (jwtUser.user != user.id)
            return res
                .status(400)
                .json({ message: "Something went wrong not same user" });
        const salt = process.env.JWT_SECRECT;
        const hash = crypto_1.default.createHmac("sha512", salt).update(password);
        const hashpassword = hash.digest("hex");
        if (user.otp === otp &&
            user.request_id === request_id &&
            email === user.email) {
            const [rows, fields] = await connection_1.connection.query("UPDATE  user set password = ? where id = ?", [
                hashpassword,
                user.id,
            ]);
        }
        return res.status(201).send({ message: "Password update successfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
});
app.post("/resetpassword", async (req, res) => {
    try {
        const { email } = req.body;
        const [rows, fields] = await connection_1.connection.query("SELECT id, email, otp_expiry, mobile FROM user WHERE email = ?", [email]);
        const user = rows?.[0];
        const response = await (0, sendOtp_1.sendOtp)(user.mobile);
        if (response) {
            const { otp, messages } = response;
            await connection_1.connection.query("UPDATE user SET otp=?, otp_expiry = NOW() + INTERVAL 1 MINUTE , request_id=?  where id= ?", [otp, messages?.sid, user?.id]);
            return res.status(201).json({
                request_id: messages.sid,
                user: user?.id,
                mobile: maskPhoneNumber(user.mobile),
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
});
app.post("/logout", isAuthenticated_1.isAuthenticated, async (req, res) => {
    try {
        req.session.destroy(function (err) {
            res.clearCookie("token");
            return res.status(200).send("logout seccesssfully");
        });
    }
    catch (error) {
        console.log(error);
    }
});
app.post("/totpactivate", isAuthenticated_1.isAuthenticated, async (req, res) => {
    try {
        const { totp_active } = req.body;
        const [rows, fields] = await connection_1.connection.query("SELECT * from user where id = ?", [
            req.session?.user,
        ]);
        const user = rows[0];
        let secrect;
        if (user.totp_key) {
            secrect = user.totp_key;
        }
        else {
            const secrectHex = crypto_1.default.randomBytes(48).toString("hex");
            secrect = OTPAuth.Secret.fromHex(secrectHex).base32;
        }
        await connection_1.connection.query("UPDATE user SET totp_key =? ,totp_active = ? where id = ?", [
            secrect,
            totp_active === "true" ? 1 : 0,
            req.session?.user,
        ]);
        let totp = new OTPAuth.TOTP({
            issuer: "Auth",
            label: "Authapp",
            algorithm: "SHA1",
            digits: 6,
            period: 60,
            secret: secrect, // or 'OTPAuth.Secret.fromBase32("NB2W45DFOIZA")'
        });
        let uri = totp.toString();
        const qrimage = await qrcode_1.default.toDataURL(uri);
        return res.status(201).json({ qrimage: qrimage, code: secrect });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
});
app.get("/api/user", isAuthenticated_1.isAuthenticated, async (req, res) => {
    try {
        if (req.session) {
            const [rows, fields] = await connection_1.connection.query("SELECT id, email, username,fullname,totp_active FROM user WHERE id = ?", [req.session?.user]);
            rows[0].totp_active = rows[0].totp_active == 1 ? true : false;
            if (rows && rows.length > 0) {
                return res.status(200).json(rows[0]);
            }
            else {
                return res.status(400).json({ messge: "something went wrong" });
            }
        }
        else {
            return res.status(401).send("unauthorized");
        }
    }
    catch (error) {
        console.log(error);
    }
});
app.use(express_1.default.static(path_1.default.join(__dirname, "../../client/dist")));
app.get("*", function (req, res) {
    res.sendFile(path_1.default.join(__dirname, "../../client/dist/index.html"));
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
