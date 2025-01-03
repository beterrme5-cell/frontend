import { Tabs } from "@mantine/core";
import {
  BodyTabsRoot,
  HistoryTableList,
  HistoryTabSection,
  LibraryBody,
  LibraryHeader,
  LibraryRoot,
  VideoTabItem,
  VideoTabItemsList,
  VideoTabSection,
} from "../../components/ui/LibraryComponents";
import { useGlobalModals } from "../../store/globalModals";
import { useEffect } from "react";
import { useLoadingBackdrop } from "../../store/loadingBackdrop";
import { useUserStore } from "../../store/userStore";
import { useParams } from "react-router-dom";
import {
  getContactTags,
  getCustomFields,
  getHistoryOfMessages,
} from "../../api/commsAPIs";
import { toast } from "react-toastify";
import { getAllVideos, getUserDomain } from "../../api/libraryAPIs";

const RecordVideo = () => {
  const videosData = useUserStore((state) => state.videosData);
  const setVideosData = useUserStore((state) => state.setVideosData);
  const historyData = useUserStore((state) => state.historyData);
  const setHistoryData = useUserStore((state) => state.setHistoryData);
  const setContactTagsData = useGlobalModals(
    (state) => state.setContactTagsData
  );
  const setCustomFieldsData = useGlobalModals(
    (state) => state.setCustomFieldsData
  );
  const { accessToken, userLocationId } = useParams();

  const setIsNewRecordingModalOpen = useGlobalModals(
    (state) => state.setIsNewRecordingModalOpen
  );

  const setUpdateDomainModalOpen = useGlobalModals(
    (state) => state.setUpdateDomainModalOpen
  );

  const setLoading = useLoadingBackdrop((state) => state.setLoading);
  const setUserDomain = useUserStore((state) => state.setUserDomain);

  // Function to Fetch all the Videos and History of the User
  const fetchData = async (token) => {
    try {
      // Fetch all data in parallel
      const [
        videosResponse,
        historyResponse,
        customFieldsResponse,
        userDomainResponse,
      ] = await Promise.all([
        getAllVideos(token),
        getHistoryOfMessages(token),
        getCustomFields(token),
        getUserDomain(token),
      ]);

      // Check responses and set state only after all are resolved
      if (
        videosResponse.success &&
        historyResponse.success &&
        customFieldsResponse.success &&
        userDomainResponse.success
      ) {
        // Update states
        setVideosData(videosResponse.data.videos);
        setHistoryData(historyResponse.data.histories);
        setCustomFieldsData(customFieldsResponse.data.customFields || []);
        setUserDomain(userDomainResponse.data.userDomain || "");

        if (
          userDomainResponse.data.userDomain === "" &&
          userDomainResponse.data.showDomainPopup
        ) {
          setUpdateDomainModalOpen(true);
        } else {
          setUpdateDomainModalOpen(false);
        }
      } else {
        if (!videosResponse.success) {
          toast.error(videosResponse.error || "Error Fetching Videos", {
            position: "bottom-right",
            autoClose: 5000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
        if (!historyResponse.success) {
          toast.error(historyResponse.error || "Error Fetching History", {
            position: "bottom-right",
            autoClose: 5000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
        if (!customFieldsResponse.success) {
          toast.error(
            customFieldsResponse.error || "Error Fetching Custom Fields",
            {
              position: "bottom-right",
              autoClose: 5000,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            }
          );
        }
        if (!userDomainResponse.success) {
          toast.error(
            customFieldsResponse.error || "Error Fetching User Domain",
            {
              position: "bottom-right",
              autoClose: 5000,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            }
          );
        }
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
      toast.error("Error Fetching Data", {
        position: "bottom-right",
        autoClose: 5000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  useEffect(() => {
    setIsNewRecordingModalOpen(true);
  }, [setIsNewRecordingModalOpen]);

  useEffect(() => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("userLocationId", userLocationId);

    if (!accessToken) {
      return;
    }

    const fetchLibraryData = async () => {
      setLoading(true);
      await fetchData(accessToken);
      setLoading(false);
    };

    fetchLibraryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    const fetchContactTags = async () => {
      const response = await getContactTags(accessToken);

      if (response.success) {
        const tagsData = response.data.userTags.map((tag) => {
          return tag.name;
        });
        setContactTagsData(tagsData);
      } else {
        console.log("Error while fetching Contact Tags: ", response.error);
      }
    };

    fetchContactTags();
  }, [setContactTagsData, accessToken]);

  return (
    <LibraryRoot>
      <LibraryHeader title="My Library" />
      <LibraryBody>
        <BodyTabsRoot>
          <Tabs.List>
            <Tabs.Tab value="videos">Videos</Tabs.Tab>
            <Tabs.Tab value="history">History</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="videos">
            <VideoTabSection heading="My Videos">
              {videosData && videosData.length > 0 ? (
                <VideoTabItemsList>
                  {videosData.map((video) => (
                    <VideoTabItem key={video._id} videoData={video} />
                  ))}
                </VideoTabItemsList>
              ) : (
                <div className="py-[10px] max-w-[450px] mx-auto">
                  <p className="text-center text-gray-500 text-[16px]">
                    No Recorded videos found! Please record a new Video or Click
                    on the upload button to upload a new video.
                  </p>
                </div>
              )}
            </VideoTabSection>{" "}
          </Tabs.Panel>

          <Tabs.Panel value="history">
            <HistoryTabSection>
              {historyData && historyData.length > 0 ? (
                <HistoryTableList historyData={historyData} />
              ) : (
                <p className="text-center text-gray-500 text-[16px]">
                  No History Found!
                </p>
              )}
            </HistoryTabSection>
          </Tabs.Panel>
        </BodyTabsRoot>
      </LibraryBody>
    </LibraryRoot>
  );
};

export default RecordVideo;
