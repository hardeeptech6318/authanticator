import axios from "axios"
import { useForm, SubmitHandler } from "react-hook-form"
import { Link } from 'react-router-dom'

type Inputs = {
fullname:string   
email :string     
username   :string
password   :string
mobile:string
}

  

function SignUp() {

    const {
        register,
        handleSubmit,
        // watch,
        // formState: { errors },
      } = useForm<Inputs>()

      
      const onSubmit: SubmitHandler<Inputs> =async (data:Inputs) => {
        // const formData = new FormData();
        // formData.append('fullname', data.fullname);
        // formData.append('email', data.email);
        // formData.append('username', data.username);
        // formData.append('password', data.password);
        // await axios.post("http://localhost:5000/signup", data, {
        //     headers: { "Content-Type": "multipart/form-data" },
        //   });
try {
    

        
// const formdata = JSON.stringify(data);

const config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'http://localhost:5000/signup',
  headers: { 
    
    
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  data : data
};


const response=await axios.request(config)
console.log(response);
} catch (error) {
 console.log(error);
    
}

      }


  return (
    <form action="" className="mx-auto max-w-lg px-6 lg:px-8  py-20 " onSubmit={handleSubmit(onSubmit)}>
    <div className="relative mb-6">
      <label className="flex  items-center mb-2 text-gray-600 text-sm font-medium">Full Name <svg width="7" height="7" className="ml-1" viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.11222 6.04545L3.20668 3.94744L1.43679 5.08594L0.894886 4.14134L2.77415 3.18182L0.894886 2.2223L1.43679 1.2777L3.20668 2.41619L3.11222 0.318182H4.19105L4.09659 2.41619L5.86648 1.2777L6.40838 2.2223L4.52912 3.18182L6.40838 4.14134L5.86648 5.08594L4.09659 3.94744L4.19105 6.04545H3.11222Z" fill="#EF4444" />
        </svg>
      </label>
      <input {...register("fullname")} className="block w-full h-11 px-5 py-2.5 bg-white leading-7 text-base font-normal shadow-xs text-gray-900 bg-transparent border border-gray-300 rounded-full placeholder-gray-400 focus:outline-none " placeholder="Name..." />
    </div>
    <div className="relative mb-6">
      <label className="flex  items-center mb-2 text-gray-600 text-sm font-medium">Email <svg width="7" height="7" className="ml-1" viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.11222 6.04545L3.20668 3.94744L1.43679 5.08594L0.894886 4.14134L2.77415 3.18182L0.894886 2.2223L1.43679 1.2777L3.20668 2.41619L3.11222 0.318182H4.19105L4.09659 2.41619L5.86648 1.2777L6.40838 2.2223L4.52912 3.18182L6.40838 4.14134L5.86648 5.08594L4.09659 3.94744L4.19105 6.04545H3.11222Z" fill="#EF4444" />
        </svg>
      </label>
      <input {...register("email")} className="block w-full h-11 px-5 py-2.5 bg-white leading-7 text-base font-normal shadow-xs text-gray-900 bg-transparent border border-gray-300 rounded-full placeholder-gray-400 focus:outline-none " placeholder="Email address..." />
    </div>
    <div className="relative mb-6">
      <label className="flex  items-center mb-2 text-gray-600 text-sm font-medium">Username <svg width="7" height="7" className="ml-1" viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.11222 6.04545L3.20668 3.94744L1.43679 5.08594L0.894886 4.14134L2.77415 3.18182L0.894886 2.2223L1.43679 1.2777L3.20668 2.41619L3.11222 0.318182H4.19105L4.09659 2.41619L5.86648 1.2777L6.40838 2.2223L4.52912 3.18182L6.40838 4.14134L5.86648 5.08594L4.09659 3.94744L4.19105 6.04545H3.11222Z" fill="#EF4444" />
        </svg>
      </label>
      <input {...register("username")} className="block w-full h-11 px-5 py-2.5 bg-white leading-7 text-base font-normal shadow-xs text-gray-900 bg-transparent border border-gray-300 rounded-full placeholder-gray-400 focus:outline-none " placeholder="Username..." />
    </div>
    <div className="relative mb-6">
      <label  className="flex  items-center mb-2 text-gray-600 text-sm font-medium">Password <svg width="7" height="7" className="ml-1" viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.11222 6.04545L3.20668 3.94744L1.43679 5.08594L0.894886 4.14134L2.77415 3.18182L0.894886 2.2223L1.43679 1.2777L3.20668 2.41619L3.11222 0.318182H4.19105L4.09659 2.41619L5.86648 1.2777L6.40838 2.2223L4.52912 3.18182L6.40838 4.14134L5.86648 5.08594L4.09659 3.94744L4.19105 6.04545H3.11222Z" fill="#EF4444" />
        </svg>
      </label>
      <input {...register("password")} className="block w-full h-11 px-5 py-2.5 bg-white leading-7 text-base font-normal shadow-xs text-gray-900 bg-transparent border border-gray-300 rounded-full placeholder-gray-400 focus:outline-none " placeholder="**********" />
    </div>


    <div className="relative mb-6">
      <label  className="flex  items-center mb-2 text-gray-600 text-sm font-medium">Password <svg width="7" height="7" className="ml-1" viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.11222 6.04545L3.20668 3.94744L1.43679 5.08594L0.894886 4.14134L2.77415 3.18182L0.894886 2.2223L1.43679 1.2777L3.20668 2.41619L3.11222 0.318182H4.19105L4.09659 2.41619L5.86648 1.2777L6.40838 2.2223L4.52912 3.18182L6.40838 4.14134L5.86648 5.08594L4.09659 3.94744L4.19105 6.04545H3.11222Z" fill="#EF4444" />
        </svg>
      </label>
      <input {...register("mobile")} maxLength={10} className="block w-full h-11 px-5 py-2.5 bg-white leading-7 text-base font-normal shadow-xs text-gray-900 bg-transparent border border-gray-300 rounded-full placeholder-gray-400 focus:outline-none " placeholder="**********" />
    </div>

    {/* <div className="relative mb-6">
      <label className="flex  items-center mb-2 text-gray-600 text-sm font-medium">Repeat Password <svg width="7" height="7" className="ml-1" viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.11222 6.04545L3.20668 3.94744L1.43679 5.08594L0.894886 4.14134L2.77415 3.18182L0.894886 2.2223L1.43679 1.2777L3.20668 2.41619L3.11222 0.318182H4.19105L4.09659 2.41619L5.86648 1.2777L6.40838 2.2223L4.52912 3.18182L6.40838 4.14134L5.86648 5.08594L4.09659 3.94744L4.19105 6.04545H3.11222Z" fill="#EF4444" />
        </svg>
      </label>
      <input type="text" id="default-search" className="block w-full h-11 px-5 py-2.5 bg-white leading-7 text-base font-normal shadow-xs text-gray-900 bg-transparent border border-gray-300 rounded-full placeholder-gray-400 focus:outline-none " placeholder="**********" />
    </div> */}
    <button className="w-52 h-12 shadow-sm rounded-full bg-indigo-600 hover:bg-indigo-800 transition-all duration-700 text-white text-base font-semibold leading-7">Sign Up</button>
    <div>Already have an account? <Link className=' ml-2 underline' to="/login">Login</Link></div>
  </form>
  )
}

export default SignUp