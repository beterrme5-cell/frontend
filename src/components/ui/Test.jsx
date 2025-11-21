function Test() {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-50">
      <div className="flex gap-8">
        {/* Solid Primary */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Solid (Current)
          </span>
          <button className="px-6 py-3 bg-primary text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Record Video
          </button>
        </div>

        {/* Ocean Depth Blue */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Ocean Depth Blue
          </span>
          <button className="px-6 py-3 bg-gradient-to-br from-[#007BFF] via-[#0062E6] to-[#004CE0] text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Record Video
          </button>
        </div>

        {/* Sapphire Blue Glow */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Sapphire Blue Glow
          </span>
          <button className="px-6 py-3 bg-gradient-to-br from-[#0F5EDD] via-[#1C6FF9] to-[#3A8BFF] text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Record Video
          </button>
        </div>

        {/* Royal Premium Blue */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Royal Premium Blue
          </span>
          <button className="px-6 py-3 bg-gradient-to-br from-[#1E40AF] via-[#1D4ED8] to-[#3B82F6] text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Record Video
          </button>
        </div>

        {/* Bold Hero Blue */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Bold Hero Blue
          </span>
          <button className="px-6 py-3 bg-gradient-to-br from-[#0052CC] via-[#0065FF] to-[#2684FF] text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Record Video
          </button>
        </div>

        {/* Neon Ice Blue */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Neon Ice Blue
          </span>
          <button className="px-6 py-3 bg-gradient-to-br from-[#00A6FF] via-[#008DFF] to-[#006BFF] text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Record Video
          </button>
        </div>
      </div>
    </div>
  );
}

export default Test;
