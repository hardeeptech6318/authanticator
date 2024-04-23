import axios from "axios"
import { useEffect, useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { Link } from 'react-router-dom'
import VerifyOtp from "./VerifyOtp"

type Inputs = {
email :string     
password   :string

}

function Login() {

  const [requestId, setrequestId] = useState(null)

  const {
    register,
    handleSubmit,
    // watch,
    // formState: { errors },
  } = useForm<Inputs>()



  const onSubmit: SubmitHandler<Inputs> =async (data:Inputs) => {
    
try {

const config = {
method: 'post',
maxBodyLength: Infinity,
url: 'http://localhost:5000/login',
headers: { 
'Content-Type': 'application/x-www-form-urlencoded'
},
data : data
};


const response=await axios.request(config)
console.log(response.data.request_id);
setrequestId(response.data?.request_id)
} catch (error) {
console.log(error);

}

  }

useEffect(()=>{
console.log(requestId);

},[requestId])

  return (
    <>
    {!requestId  ?
    <section className="flex justify-center relative">
    
    <div className="mx-auto max-w-lg px-6 lg:px-8 absolute py-20">
    
      <div className="rounded-2xl bg-white shadow-xl">
        <form action="" className="lg:p-11 p-7 mx-auto" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-11">
            <h1 className="text-gray-900 text-center font-manrope text-3xl font-bold leading-10 mb-2">Welcome Back</h1>
            <p className="text-gray-500 text-center text-base font-medium leading-6">Let’s get started with your 30 days free trail</p>
          </div>
          <input {...register("email")}  type="text" className="w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 rounded-full border-gray-300 border shadow-sm focus:outline-none px-4 mb-6" placeholder="Username"/>
          <input {...register("password")}  type="text" className="w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 rounded-full border-gray-300 border shadow-sm focus:outline-none px-4 mb-1" placeholder="Password"/>
          <a href="javascript:;" className="flex justify-end mb-6">
            <span className="text-indigo-600 text-right text-base font-normal leading-6">Forgot Password?</span>
          </a>
          <button className="w-full h-12 text-white text-center text-base font-semibold leading-6 rounded-full hover:bg-indigo-800 transition-all duration-700 bg-indigo-600 shadow-sm mb-11">Login</button>
          <Link to="/signup" className="flex justify-center text-gray-900 text-base font-medium leading-6"> Don’t have an account? <span className="text-indigo-600 font-semibold pl-3"> Sign Up</span>
          </Link>
        </form>
      </div>
    </div>
  </section>:

  <VerifyOtp requestId={requestId}/>
  
}
  </>
  )
}

export default Login