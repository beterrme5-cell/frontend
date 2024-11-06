import { Outlet } from "react-router-dom";

function App() {
  return (
    <main className="App overflow-x-hidden">
      {/* <div className="fixed top-0 z-[10] flex">Navbar Will be here</div> */}
      {/* <div className={`md:flex md:mt-[96px] mt-[72px] relative`}> */}
      {/* Sidebar Component will be here */}
      <Outlet />
      {/* </div> */}
    </main>
  );
}

export default App;
