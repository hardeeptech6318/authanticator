import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import React from 'react'
import {  useNavigate } from 'react-router-dom';


function Authenticator({children}:{children:React.ReactNode}) {

    const navigate= useNavigate();

    const queryClient = new QueryClient({
      defaultOptions:{
        queries: {
          retry:false
        }
      },
        
        
        queryCache: new QueryCache({
          
        onError: (error:Error) =>{

            const axiosError = error as AxiosError; // Type assertion
            if (axiosError.response && axiosError.response.status === 401) {
              // Redirect to the login page
              console.log(error);
              
              navigate('/login', { replace: true });
            }
          
     
        }
      }),
        
      
    });

  return (
    <QueryClientProvider client={queryClient}>
            {children}
    </QueryClientProvider>
  )
}

export default Authenticator