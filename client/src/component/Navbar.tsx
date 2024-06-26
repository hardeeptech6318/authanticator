import { useMutation } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { Avatar, Dropdown, Navbar } from "flowbite-react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

export interface UserType {
  id: number;
  email: string;
  username: string;
  fullname: string;
}

function Header({ user }: { user: AxiosResponse }) {
  const navigate = useNavigate();

  const logoutRequest = async () => {
    const data = axios.post("http://localhost:5000/logout");

    return data;
  };

  const mutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      toast.success("Logout successfully");
    },
  });

  const handleLogout = async () => {
    mutation.mutate();
    navigate("/login");
  };

  return (
    <Navbar fluid rounded>
      <Navbar.Brand href="https://flowbite-react.com">
        <img
          src="/favicon.svg"
          className="mr-3 h-6 sm:h-9"
          alt="Flowbite React Logo"
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          Flowbite React
        </span>
      </Navbar.Brand>
      <div className="flex md:order-2">
        <Dropdown
          arrowIcon={false}
          inline
          label={
            <Avatar
              alt="User settings"
              img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
              rounded
            />
          }
        >
          <Dropdown.Header>
            <Link to="/profile">
            <span className="block text-sm">{user.data.username}</span>
            <span className="block truncate text-sm font-medium">
              {user.data.email}
            </span>
            </Link>
          </Dropdown.Header>
          <Dropdown.Item>Dashboard</Dropdown.Item>
          <Dropdown.Item>Settings</Dropdown.Item>
          <Dropdown.Item>Earnings</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={handleLogout}>Sign out</Dropdown.Item>
        </Dropdown>
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link href="#" active>
          Home
        </Navbar.Link>
        <Navbar.Link href="#">About</Navbar.Link>
        <Navbar.Link href="#">Services</Navbar.Link>
        <Navbar.Link href="#">Pricing</Navbar.Link>
        <Navbar.Link href="#">Contact</Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Header;
