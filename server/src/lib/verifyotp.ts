import * as OTPAuth from "otpauth";
    
    export const verifytotp=async(otp:string,totp_key:string)=>{
        try {
            
                const totp = new OTPAuth.TOTP({
                    issuer: "Auth",
                    label: "Authapp",
                    algorithm: "SHA1",
                    digits: 6,
                    period: 30,
                    secret: totp_key, 
                  });
            
                  if(totp.generate()==otp) return true
                  else return false
            
            
        } catch (error) {
            throw new Error("Something went wrong")
        }
    }