import { Skeleton, Tabs } from "@mantine/core";
import {
  BodyTabsRoot,
  HistoryTableList,
  HistoryTabSection,
  LibraryBody,
  LibraryHeader,
  LibraryRoot,
  UploadedVideoTabItem,
  VideoTabItem,
  VideoTabItemsList,
  VideoTabSection,
} from "../../components/ui/LibraryComponents";
import { useGlobalModals } from "../../store/globalModals";
import { useEffect, useState } from "react";
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

  // Local State
  const [isLoading, setIsLoading] = useState(false);

  // Function to sort the videos
  const sortVideos = (videosData) => {
    const sortedArray = videosData.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return sortedArray;
  };

  // Function to Fetch all the Videos and History of the User
  const fetchData = async (token) => {
    try {
      setIsLoading(true);
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
        setVideosData({
          recordedVideos: sortVideos(videosResponse.data.recordedVideos || []),
          uploadedVideos: videosResponse.data.uploadedVideos,
        });
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
    } finally {
      setIsLoading(false);
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
          return {
            key: tag.id,
            label: tag.name,
            value: tag.id,
          };
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
            <VideoTabSection heading="Recorded Videos">
              {isLoading ? (
                <VideoTabItemsList>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="!rounded-lg !min-w-[250px] !h-[210px]"
                    />
                  ))}
                </VideoTabItemsList>
              ) : videosData?.recordedVideos?.length > 0 ? (
                <VideoTabItemsList>
                  {videosData?.recordedVideos?.map((video) => (
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
            </VideoTabSection>
            <VideoTabSection heading="Uploaded Videos">
              {isLoading ? (
                <VideoTabItemsList>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="!rounded-lg !min-w-[250px] !h-[210px]"
                    />
                  ))}
                </VideoTabItemsList>
              ) : videosData?.uploadedVideos?.length > 0 ? (
                <VideoTabItemsList>
                  {videosData?.uploadedVideos?.map((video, index) => (
                    <UploadedVideoTabItem key={index} videoData={video} />
                  ))}
                </VideoTabItemsList>
              ) : (
                <div className="py-[10px] max-w-[450px] mx-auto">
                  <p className="text-center text-gray-500 text-[16px]">
                    No Uploaded videos found in the Media Storage! Please upload
                    a new Video by clicking on the upload button.
                  </p>
                </div>
              )}
            </VideoTabSection>
          </Tabs.Panel>

          <Tabs.Panel value="history">
            <HistoryTabSection>
              {isLoading ? (
                <div className="flex flex-col gap-2 w-full">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="!rounded-lg !w-full !h-[50px]"
                    />
                  ))}
                </div>
              ) : historyData.length > 0 ? (
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
