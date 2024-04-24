import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import Header from "../component/Navbar"



function Home() {

  const getUser=async()=>{
    const user= await axios.get("http://localhost:5000/api/user")
    return user
  }
  const query = useQuery({ queryKey: ['getuser'], queryFn: getUser })

  
if(query.data){
  return <Header user={query?.data}/>
}


}

export default Home