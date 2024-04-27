
import { Route, Routes } from "react-router-dom"
import Home from "./route/Home"
import Login from "./route/Login"
import SignUp from "./route/SignUp"
import Forgotpassword from "./route/Forgotpassword";
import Profile from "./route/Profile";



function App() {
  console.log("reload");  
  
  return (
    <div className=" h-screen w-full bg-[url('https://pagedone.io/asset/uploads/1691055810.png')] bg-center bg-cover">
    <Routes >
      { <Route path="/" element={<Home />} />}
      <Route path="/forgotpassword" element={<Forgotpassword/>} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
    </div>
  )
}

export default App