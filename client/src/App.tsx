
import { Route, Routes } from "react-router-dom"
import Home from "./route/Home"
import Login from "./route/Login"
import SignUp from "./route/SignUp"



function App() {
  console.log("reload");  
  
  return (
    <div className=" h-screen w-full bg-[url('https://pagedone.io/asset/uploads/1691055810.png')] bg-center bg-cover">
    <Routes >
      { <Route path="/" element={<Home />} />}
      {/* <Route path="/verifyotp" element={<VerifyOtp />} /> */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
    </div>
  )
}

export default App