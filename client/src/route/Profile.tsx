import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import {  useEffect, useState } from "react"
import { ToggleSwitch } from "flowbite-react";

interface TotpResponseTypes{
    qrimage:string | null,
    code:string | null
}


function Profile() {
    const getUser=async()=>{
        const user= await axios.get("http://localhost:5000/api/user")
        return user
      }
      const query = useQuery({ queryKey: ['getuser'], queryFn: getUser })
      
      
      const [switch1, setSwitch1] = useState(query.data?.data.totp_active);
      const [response, setresponse] = useState<TotpResponseTypes>({qrimage:null,code:null})

      useEffect(()=>{
            setSwitch1(query.data?.data.totp_active)
      },[query?.data?.data?.totp_active])

      const mutation = useMutation({
        mutationFn: async (e:boolean) => {
          
          const config = {
            method: "post",
            maxBodyLength: Infinity,
            url: "http://localhost:5000/totpactivate",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            data: {
             totp_active:e
            },
          };
          const response = await axios.request(config);
    
          
          return response;
        },
    
        onSuccess: (data) => {
            
            setresponse(data.data)
            
            
        //   navigate("/");
        },
    
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (err:any) => {
            console.log(err);
            
          
        //   toast.error(err?.data?.message)
        },
      });
      
  return (
    
  
    <main className="w-full min-h-screen py-1   m-auto">
        <div className="p-2 md:p-4">
            <div className="w-full px-6 pb-8 mt-8  sm:rounded-lg">
                <h2 className="pl-6 text-2xl font-bold sm:text-xl">Public Profile</h2>

                <div className="grid max-w-2xl mx-auto mt-8">
                    <div className="flex flex-col items-center space-y-5 sm:flex-row sm:space-y-0">

                        <img className="object-cover w-40 h-40 p-1 rounded-full ring-2 ring-indigo-300 dark:ring-indigo-500"
                            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZhY2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
                            alt="Bordered avatar"/>

                        <div className="flex flex-col space-y-5 sm:ml-8">
                            <button type="button"
                                className="py-3.5 px-7 text-base font-medium text-indigo-100 focus:outline-none bg-[#202142] rounded-lg border border-indigo-200 hover:bg-indigo-900 focus:z-10 focus:ring-4 focus:ring-indigo-200 ">
                                Change picture
                            </button>
                            <button type="button"
                                className="py-3.5 px-7 text-base font-medium text-indigo-900 focus:outline-none bg-white rounded-lg border border-indigo-200 hover:bg-indigo-100 hover:text-[#202142] focus:z-10 focus:ring-4 focus:ring-indigo-200 ">
                                Delete picture
                            </button>
                        </div>
                    </div>

                    <div className="items-center mt-8 sm:mt-14 text-[#202142]">

                        <div
                            className="flex flex-col items-center w-full mb-2 space-x-0 space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0 sm:mb-6">
                            <div className="w-full">
                                <label 
                                
                                    className="block mb-2 text-sm font-medium text-indigo-900 dark:text-white">Your
                                    first name</label>
                                    <div>{query.data?.data.fullname}</div>
                                {/* <input type="text" id="first_name"
                                    className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 "
                                    placeholder="Your first name" value="Jane" required/> */}
                            </div>

                            {/* <div className="w-full">
                                <label 
                                // for="last_name"
                                    className="block mb-2 text-sm font-medium text-indigo-900 dark:text-white">Your
                                    last name</label>
                                <input type="text" id="last_name"
                                    className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 "
                                    placeholder="Your last name" value="Ferguson" required/>
                            </div> */}

                        </div>

                        <div className="mb-2 sm:mb-6">
                            <label 
                            // for="email"
                                className="block mb-2 text-sm font-medium text-indigo-900 dark:text-white">Your
                                email</label>
                                <div>{query.data?.data.email}</div>
                            {/* <input type="email" id="email"
                                className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 "
                                placeholder="your.email@mail.com" required/> */}
                        </div>

                        {/* <div className="mb-2 sm:mb-6">
                            <label 
                            // for="profession"
                                className="block mb-2 text-sm font-medium text-indigo-900 dark:text-white">Profession</label>
                            <input type="text" id="profession"
                                className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 "
                                placeholder="your profession" required/>
                        </div> */}

                        {/* <div className="mb-6">
                            <label 
                            // for="message"
                                className="block mb-2 text-sm font-medium text-indigo-900 dark:text-white">Bio</label>
                            <textarea id="message" 
                            // rows="4"
                                className="block p-2.5 w-full text-sm text-indigo-900 bg-indigo-50 rounded-lg border border-indigo-300 focus:ring-indigo-500 focus:border-indigo-500 "
                                placeholder="Write your bio here..."></textarea>
                        </div> */}
{/* 
                        <div className="flex justify-end">
                            <button type="submit"
                                className="text-white bg-indigo-700  hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800">Save</button>
                        </div> */}

                        
<ToggleSwitch checked={switch1} label={`${switch1?"Preview totp secrect":'Enable totp'}`} onChange={(e)=>{setSwitch1(e);mutation.mutate(e)}} />



{ switch1 &&
<>
<button onClick={()=>mutation.mutate(true)} >Show code</button>

{
response?.qrimage && response?.code &&

<div>
    
    <img src={response?.qrimage} alt="qrcode"/>
    <div>{response?.code}</div>
    </div>
}
    </>
    }


                    </div>
                </div>
            </div>
        </div>
    </main>

  )
}

export default Profile