"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function isAuthenticated(req, res, next) {
    try {
        if (req?.session?.user) {
            const cookieValue = req?.headers?.cookie.split(";");
            let token;
            cookieValue?.forEach((element) => {
                if (element?.trim().startsWith("token")) {
                    token = element.split("=")[1];
                }
            });
            if (!token) {
                console.log("token not available");
                return res.status(401).send("unauthorized");
            }
            if (token) {
                const jwtUser = jsonwebtoken_1.default.verify(token, "strongsecrect");
                if (jwtUser?.user === req.session.user) {
                    next();
                }
                else {
                    return res.status(401).send("unauthorized");
                }
            }
        }
        else {
            console.log("session not available");
            return res.status(401).send("unauthorized");
        }
    }
    catch (error) {
        console.log(error);
        res.redirect("/login");
    }
}
exports.isAuthenticated = isAuthenticated;
