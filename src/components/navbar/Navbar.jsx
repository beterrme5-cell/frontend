import { useState } from "react";
import { Avatar, Popover, Button, Group, Text, Divider } from "@mantine/core";
import logo from "@/assets/logo.svg";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/userStore";

const Navbar = () => {
  const navigator = useNavigate();
  const user = useUserStore((state) => state.user);
  const [opened, setOpened] = useState(false);

  const handleLogout = () => {
    console.log("User logged out");
    Cookies.remove("authToken");
    navigator("/login");
  };

  return (
    <nav className="flex justify-between bg-white md:p-[15px_30px] p-[10px_20px] shadow-sm fixed top-0 left-0 w-screen">
      <img src={logo} alt="logo-icon" />
      <Popover
        opened={opened}
        onClose={() => setOpened(false)}
        position="bottom-end"
        withArrow
        shadow="md"
      >
        <Popover.Target>
          <div
            className="flex flex-col justify-center items-center text-gray-500 cursor-pointer"
            onClick={() => setOpened((prev) => !prev)}
          >
            <Avatar
              size="md"
              src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
            />
          </div>
        </Popover.Target>

        <Popover.Dropdown style={{ width: "200px" }}>
          <Group position="apart" mb="sm">
            <Avatar
              size="sm"
              src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
            />
            <p className="text-[16px] font-bold">{user.name}</p>
          </Group>
          <Text size="xs" color="dimmed">
            {user.email}
          </Text>
          <Divider my="sm" />
          <Button
            fullWidth
            variant="outline"
            color="red"
            onClick={handleLogout}
          >
            Log out
          </Button>
        </Popover.Dropdown>
      </Popover>
    </nav>
  );
};

export default Navbar;
