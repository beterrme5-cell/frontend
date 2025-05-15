import { Loader } from "@mantine/core";
import { useLoadingBackdrop } from "../../store/loadingBackdrop";

const LoadingBackdrop = () => {
  const isLoading = useLoadingBackdrop((state) => state.isLoading);
  return (
    isLoading && (
      <div className="bg-white absolute w-screen h-screen z-[1000] flex justify-center items-center">
        <Loader
          position="fixed"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          size={40}
          color="blue"
        />
      </div>
    )
  );
};

export default LoadingBackdrop;
