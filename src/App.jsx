import { Outlet } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";

function App() {
  return (
    <main className="App overflow-x-hidden">
      <Navbar />
      <section className="md:p-[32px] p-[20px] md:mt-[79px] mt-[69px]">
        <Outlet />
      </section>
    </main>
  );
}

export default App;
