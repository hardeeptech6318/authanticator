import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {  FormEvent, useState } from 'react';
import OtpInput from 'react-otp-input';

function VerifyOtp() {

    const [otp, setOtp] = useState('');

    


    const mutation = useMutation({
      mutationFn:async () => {
        const fromdata=new FormData()
        fromdata.append("otp",otp)
        const respone=await axios.post("http://localhost:5000/verifyotp",fromdata)

        return respone
      },
    })

    const handleSubmit=async(event:FormEvent)=>{
      event.preventDefault()
    await mutation.mutate()
    
      
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
                <p>Didn't recieve code?</p> <a className="flex flex-row items-center text-blue-600" href="http://" target="_blank" rel="noopener noreferrer">Resend</a>
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