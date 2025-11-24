import { DotLottieReact } from "@lottiefiles/dotlottie-react";

function Loading() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 w-[400px] max-w-[95vw] flex flex-col items-center gap-6 shadow-2xl border border-gray-200">
        <DotLottieReact
          src="loadinganimation.json"
          loop
          autoplay
          width={400}
          height={400}
          className="w-52 h-52"
        />

        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Preparing your assets
          </h3>
          <p className="text-sm text-gray-500">
            Please wait while we process your video...
          </p>
        </div>
      </div>
    </div>
  );
}

export default Loading;
