import { FiVideo } from "react-icons/fi";

import { HiViewGrid, HiViewList } from "react-icons/hi";

import { FiGrid } from "react-icons/fi";

import { LuTrendingUp } from "react-icons/lu";

function D() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with border and shadow */}
      <header className="bg-white border-b shadow-sm px-6 py-4">
        <div className="flex justify-center">
          <img
            src="https://res.cloudinary.com/dmdaa1heq/image/upload/v1748271556/Konnectd_Logo_Reversed_el4sw9.png"
            alt="Konnectd Logo"
            className="h-8 w-auto"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center ">
        <div className="max-w-6xl w-full">
          {/* Centered Title Section */}
          <div className="text-center mb-16">
            <p className="text-lg text-center mx-auto text-gray-600 max-w-2xl tracking-wide leading-relaxed">
              Create stunning property videos, manage your video library, and
              track engagement - all in one powerful platform
            </p>
          </div>

          {/* Three Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Card 1 - Create New Video */}
            <div className="bg-white rounded-xl flex flex-col items-center p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="border rounded-lg p-4 w-16 h-16 flex items-center justify-center mb-6 icon-container-glow">
                <FiVideo className="text-primary" size={28} />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gradient-blue">
                  Create New Video
                </h3>
                <span className="bg-gradient-blue text-white text-xs px-2 py-1 rounded-full">
                  HD Recording
                </span>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 tracking-wide">
                  Record a professional video using your webcam with built-in
                  editing tools
                </p>
              </div>
            </div>

            {/* Card 2 - Video Library */}
            <div className="bg-white rounded-xl flex flex-col items-center p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="border rounded-lg p-4 w-16 h-16 flex items-center justify-center mb-6 icon-container-glow">
                <FiGrid className="text-primary" size={28} />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gradient-blue">
                  Video Library
                </h3>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 tracking-wide">
                  View, manage, and share all your recorded videos in one place
                </p>
              </div>
            </div>

            {/* Card 3 - Analytics */}
            <div className="bg-white rounded-xl flex flex-col items-center p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="border rounded-lg p-4 w-16 h-16 flex items-center justify-center mb-6 icon-container-glow">
                <LuTrendingUp className="text-primary" size={28} />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gradient-blue">
                  Analytics
                </h3>
                <span className="bg-gradient-blue text-white text-xs px-2 py-1 rounded-full">
                  Real-time
                </span>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 tracking-wide">
                  Track video performance, engagement metrics, and viewer
                  insights
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Info Bar */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="text-center text-gray-700 tracking-wider">
              Record professional videos directly from your browser • No
              downloads required • Automatic cloud storage
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default D;
