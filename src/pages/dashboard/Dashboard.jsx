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
import { useUserStore } from "../../store/userStore";
import { toast } from "react-toastify";
import { getAllVideos, getUserDomain } from "../../api/libraryAPIs";
import {
  getContactTags,
  getCustomFields,
  getHistoryOfMessages,
} from "../../api/commsAPIs";
import { useLoadingBackdrop } from "../../store/loadingBackdrop";
import { getDecryptedUserData } from "../../api/auth";
import { useGlobalModals } from "../../store/globalModals";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const videosData = useUserStore((state) => state.videosData);
  const historyData = useUserStore((state) => state.historyData);
  const setVideosData = useUserStore((state) => state.setVideosData);
  const setHistoryData = useUserStore((state) => state.setHistoryData);
  const setLoading = useLoadingBackdrop((state) => state.setLoading);
  const setContactTagsData = useGlobalModals(
    (state) => state.setContactTagsData
  );
  const setCustomFieldsData = useGlobalModals(
    (state) => state.setCustomFieldsData
  );
  const setUpdateDomainModalOpen = useGlobalModals(
    (state) => state.setUpdateDomainModalOpen
  );

  const setUserDomain = useUserStore((state) => state.setUserDomain);

  // Function to sort the videos
  const sortVideos = (videosData) => {
    const sortedArray = videosData.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return sortedArray;
  };

  // Function to Fetch all the Data
  const fetchData = async (accessToken) => {
    try {
      // Fetch all data in parallel
      const [
        videosResponse,
        historyResponse,
        customFieldsResponse,
        userDomainResponse,
        contactTagsResponse,
      ] = await Promise.all([
        getAllVideos(accessToken),
        getHistoryOfMessages(accessToken),
        getCustomFields(accessToken),
        getUserDomain(accessToken),
        getContactTags(accessToken),
      ]);

      // Check responses and set state only after all are resolved
      if (
        videosResponse.success &&
        historyResponse.success &&
        customFieldsResponse.success &&
        userDomainResponse.success &&
        contactTagsResponse.success
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

        const tagsData = contactTagsResponse.data.userTags.map((tag) => {
          return {
            key: tag.id,
            label: tag.name,
            value: tag.id,
          };
        });
        setContactTagsData(tagsData);
      } else {
        if (!videosResponse.success) {
          toast.error("Error Fetching Videos", {
            position: "bottom-right",
            autoClose: 5000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
        if (!historyResponse.success) {
          toast.error("Error Fetching History", {
            position: "bottom-right",
            autoClose: 5000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
        if (!customFieldsResponse.success) {
          toast.error("Error Fetching Custom Fields", {
            position: "bottom-right",
            autoClose: 5000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
        if (!userDomainResponse.success) {
          toast.error("Error Fetching User Domain", {
            position: "bottom-right",
            autoClose: 5000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
        if (!contactTagsResponse.success) {
          toast.error("Error Fetching Contact Tags", {
            position: "bottom-right",
            autoClose: 5000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
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

  // Function to Get Key from GHL iFrame and Save it in Local Storage
  const postKeyToAPIAndCheckUserId = async () => {
    try {
      const key = await new Promise((resolve) => {
        window.parent.postMessage({ message: "REQUEST_USER_DATA" }, "*");
        window.addEventListener("message", ({ data }) => {
          if (data.message === "REQUEST_USER_DATA_RESPONSE") {
            resolve(data.payload);
          } else {
            resolve(null);
          }
        });
      });

      return key;
    } catch (error) {
      console.error("Error fetching key from GHL iFrame: ", error);
      return null;
    }
  };

  const { isPending, isError, error } = useQuery({
    queryKey: ["libraryData"],
    queryFn: async () => {
      const key = await postKeyToAPIAndCheckUserId();
      setLoading(false);

      console.log("Key from GHL iFrame: ", key);

      // Send Data to the Backend API to Decrypt the code
      const response = await getDecryptedUserData({ tokenKey: key });

      if (!response.success || response.data.accessToken === undefined) {
        throw new Error("Failed to fetch access token");
      }

      // Save the accountId and userLocationId in the Local Storage
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("userLocationId", response.data.user.userLocationId);

      // Fetch all the Data
      return fetchData(response.data.accessToken);
    },
  });

  if (isError) {
    console.error("Error fetching library data: ", error);
    toast.error("Error Fetching Library Data", {
      position: "bottom-right",
      autoClose: 5000,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

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
              {isPending ? (
                <VideoTabItemsList>
                  {Array.from({ length: 5 }).map((_, index) => (
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
              {isPending ? (
                <VideoTabItemsList>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="!rounded-lg !min-w-[250px] !h-[210px]"
                    />
                  ))}
                </VideoTabItemsList>
              ) : videosData?.uploadedVideos?.length > 0 ? (
                <VideoTabItemsList>
                  {videosData?.uploadedVideos?.map((video) => (
                    <UploadedVideoTabItem key={video._id} videoData={video} />
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
              {isPending ? (
                <div className="flex flex-col gap-2 w-full">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="!rounded-lg !w-full !h-[50px]"
                    />
                  ))}
                </div>
              ) : historyData.length > 0 ? (
                <HistoryTableList />
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

export default Dashboard;
