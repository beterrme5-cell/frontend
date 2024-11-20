import { TextInput, PasswordInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useGlobalModals } from "../store/globalModals";
import { loginUser } from "../api/auth";
import { useLoadingBackdrop } from "../store/loadingBackdrop";

const LoginPage = () => {
  const setUser = useGlobalModals((state) => state.setUser);

  const setIsLoading = useLoadingBackdrop((state) => state.setLoading);

  const navigate = useNavigate();
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length >= 4 ? null : "Password must be at least 6 characters",
    },
  });

  const handleSubmit = async (values) => {
    setIsLoading(true);

    const response = await loginUser({
      email: values.email,
      password: values.password,
    });

    if (response.success) {
      Cookies.set("token", response.data.token);
      setUser(response.data.user);
      navigate("/dashboard");
    } else {
      console.error("Error while logging in user: ", response.error);
    }

    setIsLoading(false);
  };

  return (
    <section className="h-screen w-screen flex justify-center items-center p-[40px]">
      <div className="md:w-[585px] md:h-[530px] w-full h-fit !flex flex-col justify-center bg-[#f9fafc] p-[50px_72.5px] border rounded-[20px]">
        <h1 className="text-[#1b1b1b] text-[30px] font-bold">Login</h1>
        <p className="text-[18px] text-[#545454]">
          Please Login using given Email and Password
        </p>
        <form
          onSubmit={form.onSubmit(handleSubmit)}
          style={{ marginTop: "20px" }}
          className="mt-[30px] flex flex-col gap-[30px]"
        >
          <div className="flex flex-col gap-[16px]">
            <TextInput
              placeholder="get@ziontutorial.com"
              {...form.getInputProps("email")}
              required
            />
            <PasswordInput
              placeholder="Password"
              {...form.getInputProps("password")}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-primary h-[60px] rounded-[8px] text-white font-medium text-[20px]"
          >
            Log in
          </button>
        </form>
      </div>
    </section>
  );
};

export default LoginPage;
