import { useMutation} from '@tanstack/react-query';
import axios from 'axios';
import {  FormEvent, useEffect, useState } from 'react';
import OtpInput from 'react-otp-input';
import { useNavigate } from 'react-router-dom';

function VerifyOtp({requestId,user}:{requestId:string | null,user:string | null}) {

    const [disableButton, setdisableButton] = useState(true)
    const [requestID2, setrequestID2] = useState(requestId)
    const [timer, settimer] = useState(0)

    useEffect(()=>{
      let countdown = 60; // 60 seconds
      const countdownInterval = setInterval(() => {
          if (countdown <= 0) {
              clearInterval(countdownInterval);
              setdisableButton(false);
              return;
          }
          settimer(countdown)
          countdown--;
      }, 1000);
    },[])


    const [otp, setOtp] = useState('');

    const navigate=useNavigate()


    const mutation = useMutation({
      mutationFn:async () => {
        
        if(otp==""){
          return
        }
        const config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'http://localhost:5000/verifyotp',
          headers: { 
          'Content-Type': 'application/x-www-form-urlencoded'
          },
          data : {
            otp,request_id: requestID2,user
          }
          };
        const response=await axios.request(config)
          
0
        return response
      },

      onSuccess:()=>{
        navigate("/")
      },
      
      onError:(err)=>{
        console.log(err);
        
      }
    })

    const mutationResend = useMutation({
      mutationFn:async () => {
        
        // if(!requestId || !user){

        // }
        
        const config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'http://localhost:5000/resendotp',
          headers: { 
          'Content-Type': 'application/x-www-form-urlencoded'
          },
          data : {
            request_id: requestId,user,
            
          }
          };
        const response=await axios.request(config)
          
0
        return response
      },

      onSuccess:(data)=>{
        // navigate("/")
        // console.log(data.data);
        setrequestID2(data.data.request_id)
        
        console.log("reqquest seccess");
        
      },
      onError:(err)=>{
        console.log(err);
        
      }
    })

    const handleSubmit=async(event:FormEvent)=>{
      event.preventDefault()
     mutation.mutate()
    
      
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleResend=async(event:FormEvent)=>{
      event.preventDefault()
      mutationResend.mutate()
    }
    

  

  return (
    
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-12">
  <div className="relative bg-white px-6 pt-10 pb-9 shadow-xl mx-auto w-full max-w-lg rounded-2xl">
    <div className="mx-auto flex w-full max-w-md flex-col space-y-16">
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <div className="font-semibold text-3xl">
          <p>Email Verification</p>
        </div>
        <div className="flex flex-row text-sm font-medium text-gray-400">
          <p>We have sent a code to your email ba**@dipainhouse.com</p>
        </div>
      </div>

      <div>
        <form action="" method="post" onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-16">
          <OtpInput
    value={otp}
    inputType='number'
    onChange={setOtp}
    numInputs={6}
    renderSeparator={<span>-</span>}
    renderInput={(props) => <input {...props} />}
    inputStyle="border w-full border-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    containerStyle="w-full justify-between gap-3"
  />

            <div className="flex flex-col space-y-5">
              <div>
                <button className="flex flex-row items-center justify-center text-center w-full border rounded-xl outline-none py-5 bg-blue-700 border-none text-white text-sm shadow-sm">
                  Verify Account
                </button>
              </div>

              <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                <p>Didn't recieve code?</p>
                <div>{timer}</div>
                 <button className="flex flex-row items-center text-blue-600" 
                 disabled={disableButton}
                  onClick={handleResend} >Resend</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
  )
}

export default VerifyOtp