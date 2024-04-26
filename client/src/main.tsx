import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter} from "react-router-dom"
// import {
//   QueryCache,
//   QueryClient,
//   QueryClientProvider,
  
// } from '@tanstack/react-query'
import Authenticator from './CustomError/Authenticator.tsx'
import { Toaster } from 'react-hot-toast';


// import { AxiosError } from 'axios'



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    
    <BrowserRouter>
    <Authenticator>
      <Toaster/>
    <App />
    </Authenticator>
    
    </BrowserRouter>
    
  </React.StrictMode>,
)
