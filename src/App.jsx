import { Outlet } from "react-router-dom";
import { useGlobalModals } from "./store/globalModals";
import {
  ContactsSelectionModalEmail,
  ContactsSelectionModalSMS,
} from "./components/ui/GlobalModals";

function App() {
  const isSMSContactsSelectionModalOpen = useGlobalModals(
    (state) => state.isSMSContactsSelectionModalOpen
  );

  const isContactsSelectionModalOpen = useGlobalModals(
    (state) => state.isContactsSelectionModalOpen
  );

  return (
    <main className="App overflow-x-hidden md:p-[32px] p-[20px]">
      {isContactsSelectionModalOpen && <ContactsSelectionModalEmail />}
      {isSMSContactsSelectionModalOpen && <ContactsSelectionModalSMS />}
      <Outlet />
    </main>
  );
}

export default App;
