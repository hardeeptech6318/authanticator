
import otpGenerator from "otp-generator";

import twilio from "twilio";

const accountSid = process.env.TWILO_ACCOUNT_SID as string;
const authToken = process.env.TWILO_AUTH_TOKEN as string;


const client = twilio(accountSid, authToken);

export const sendOtp=async(mobile:string)=>{
    try {
        const sixDigitotp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets:false
          });
  
          const messages = await client.messages.create({
            body: `otp verification code for authapp ${sixDigitotp}`,
            to: `+91${mobile}`,
            from: process.env.TWILO_MOBILE_NO as string,
          });

          return {otp:sixDigitotp,messages:messages}


    } catch (error) {
        console.log(error);
        
    }
}