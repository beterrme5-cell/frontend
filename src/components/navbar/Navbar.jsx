import { Avatar } from "@mantine/core";
import logo from "../../assets/logo.svg";

const Navbar = () => {
  return (
    <nav className="flex justify-between bg-white md:p-[15px_30px] p-[10px_20px] shadow-sm fixed top-0 left-0 w-screen">
      <img src={logo} alt="logo-icon" />
      <Avatar
        size="md"
        src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
      />
    </nav>
  );
};

export default Navbar;
