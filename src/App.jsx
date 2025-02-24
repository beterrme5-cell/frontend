import { Outlet } from "react-router-dom";
import { useGlobalModals } from "./store/globalModals";
import {
  // ContactsSelectionModalEmail,
  // ContactsSelectionModalSMS,
  DeleteVideoConfirmationModal,
  EditVideoModal,
  PreRecordingDataInputModal,
  ShareVideoModal,
  StartRecordingWarningModal,
  UpdateUserDomainModal,
} from "./components/ui/GlobalModals";

function App() {
  // const isSMSContactsSelectionModalOpen = useGlobalModals(
  //   (state) => state.isSMSContactsSelectionModalOpen
  // );

  // const isContactsSelectionModalOpen = useGlobalModals(
  //   (state) => state.isContactsSelectionModalOpen
  // );

  const isShareVideoModalOpen = useGlobalModals(
    (state) => state.isShareVideoModalOpen
  );

  const isVideoLinkNotAttachedModalOpen = useGlobalModals(
    (state) => state.isVideoLinkNotAttachedModalOpen
  );

  const isEditVideoModalOpen = useGlobalModals(
    (state) => state.isEditVideoModalOpen
  );
  const isDeleteVideoModalOpen = useGlobalModals(
    (state) => state.isDeleteVideoModalOpen
  );
  const updateDomainModalOpen = useGlobalModals(
    (state) => state.updateDomainModalOpen
  );
  const isWarningModalOpen = useGlobalModals(
    (state) => state.isWarningModalOpen
  );
  const isNewRecordingModalOpen = useGlobalModals(
    (state) => state.isNewRecordingModalOpen
  );
  return (
    <main className="App overflow-x-hidden md:p-[32px] p-[20px]">
      {/* {isContactsSelectionModalOpen && <ContactsSelectionModalEmail />}
      {isSMSContactsSelectionModalOpen && <ContactsSelectionModalSMS />} */}
      {(isShareVideoModalOpen || isVideoLinkNotAttachedModalOpen) && (
        <ShareVideoModal />
      )}
      {isEditVideoModalOpen && <EditVideoModal />}
      {isDeleteVideoModalOpen && <DeleteVideoConfirmationModal />}
      {updateDomainModalOpen && <UpdateUserDomainModal />}
      {isWarningModalOpen && <StartRecordingWarningModal />}
      {isNewRecordingModalOpen && <PreRecordingDataInputModal />}
      <Outlet />
    </main>
  );
}

export default App;
