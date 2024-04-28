"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtp = void 0;
const otp_generator_1 = __importDefault(require("otp-generator"));
const twilio_1 = __importDefault(require("twilio"));
const accountSid = process.env.TWILO_ACCOUNT_SID;
const authToken = process.env.TWILO_AUTH_TOKEN;
const client = (0, twilio_1.default)(accountSid, authToken);
const sendOtp = async (mobile) => {
    try {
        const sixDigitotp = otp_generator_1.default.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });
        console.log(sixDigitotp);
        console.log(process.env.TWILO_MOBILE_NO);
        const messages = await client.messages.create({
            body: `otp verification code for authapp ${sixDigitotp}`,
            to: `${mobile}`,
            from: process.env.TWILO_MOBILE_NO,
        });
        return { otp: sixDigitotp, messages: messages };
    }
    catch (error) {
        console.log(error);
    }
};
exports.sendOtp = sendOtp;
