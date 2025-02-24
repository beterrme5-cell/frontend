import { Menu, Tabs, Table, CopyButton, Divider } from "@mantine/core";
import { useGlobalModals } from "../../store/globalModals";
import { Link, useLocation } from "react-router-dom";
import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Quill from "quill";
import { createInstance } from "@loomhq/record-sdk";
import { isSupported } from "@loomhq/record-sdk/is-supported";
import { saveRecordedVideo } from "../../api/libraryAPIs";
import { useUserStore } from "../../store/userStore";
import { setupLoomSDK } from "../../api/loomSDK";
import {
  ARROW_RIGHT,
  COPY_ICON,
  DELETE_ICON,
  EDIT_ICON,
  SHARE_ICON,
  SHAREVIDEO_ICON,
  VIDEO_OPTIONS_ICON,
} from "../../assets/icons/DynamicIcons";
import { useLoadingBackdrop } from "./../../store/loadingBackdrop";

// Customn Fonts - Quill Editor
const FontAttributor = Quill.import("attributors/class/font");
FontAttributor.whitelist = ["arial", "sansserif", "serif", "monospace"];
Quill.register(FontAttributor, true);

export const LibraryRoot = ({ children }) => {
  return (
    <section className="bg-white p-[32px] rounded-[12px]">{children}</section>
  );
};

export const LibraryHeader = ({ title }) => {
  const pageLocation = useLocation();
  const userLocationId = localStorage.getItem("userLocationId");
  const userDomain = useUserStore((state) => state.userDomain);

  const handleRedirectToMediaStorage = async () => {
    if (userDomain) {
      const newTab = window.open(
        `https://${userDomain}/v2/location/${userLocationId}/media-storage`,
        "_blank"
      );

      if (newTab) {
        newTab.focus();
      }
    } else {
      const newTab = window.open(
        `https://app.gohighlevel.com/v2/location/${userLocationId}/media-storage`,
        "_blank"
      );

      if (newTab) {
        newTab.focus();
      }
    }
  };

  return (
    <header className="flex items-center justify-between">
      <h1 className="text-[28px] font-bold ">{title}</h1>
      <div className="flex items-center gap-[12px]">
        <button
          type="button"
          className="p-[8px_16px] text-[14px] font-medium rounded-[8px] bg-white border border-gray-dark text-darkBlue"
          onClick={handleRedirectToMediaStorage}
        >
          Upload Video
        </button>
        {pageLocation.pathname.split("/")[1] === "recordings" ? (
          <RecordLoomVideoBtn />
        ) : (
          <NewRecordingBtn />
        )}
      </div>
    </header>
  );
};

const NewRecordingBtn = () => {
  const setIsWarningModalOpen = useGlobalModals(
    (state) => state.setIsWarningModalOpen
  );

  const handleNewRecordingBtnClick = async () => {
    setIsWarningModalOpen(true);

    const accessToken = localStorage.getItem("accessToken");
    const userLocationId = localStorage.getItem("userLocationId");

    if (!accessToken) {
      console.error("Access Token not found");
      return;
    }

    // create a new tab and navigate to the new recording page
    const newTab = window.open(
      `${
        import.meta.env.VITE_RECORD_PAGE_URL
      }/recordings/${accessToken}/${userLocationId}`,
      "_blank"
    );

    if (newTab) {
      newTab.focus();
    }
  };

  return (
    <button
      className="bg-primary text-white border-none p-[8px_16px] text-[14px] font-medium rounded-[8px] hover:cursor-pointer"
      onClick={handleNewRecordingBtnClick}
    >
      Record Video
    </button>
  );
};

export const RecordLoomVideoBtn = () => {
  const setIsNewRecordingModalOpen = useGlobalModals(
    (state) => state.setIsNewRecordingModalOpen
  );
  return (
    <button
      id="loom-record-sdk-button"
      className="bg-primary text-white border-none p-[8px_16px] text-[14px] font-medium rounded-[8px] hover:cursor-pointer"
      type="button"
      onClick={() => {
        setIsNewRecordingModalOpen(true);
      }}
    >
      Record Video
    </button>
  );
};

// Start Recording Button for the Record Video Modal
export const StartRecordingBtn = ({
  onStartRecording,
  afterRecordingStart,
  recordingName,
  disabled,
  showStartRecordingBtn,
  setShowStartRecordingBtn,
  settingLoom,
  setSettingLoom,
}) => {
  const BUTTON_ID = "start-recording-button";
  const videosData = useUserStore((state) => state.videosData);
  const setVideosData = useUserStore((state) => state.setVideosData);
  const LOOM_APP_ID = "a0b41709-338e-4393-8090-cb7ed475e127";

  const setLoading = useLoadingBackdrop((state) => state.setLoading);

  const [loomJWS, setLoomJWS] = useState("");

  // Initial Loom SDK Setup
  useEffect(() => {
    async function setupLoomInitial() {
      try {
        // Fetch the signed JWT from the server
        const response = await setupLoomSDK();

        if (!response.success) {
          throw new Error("Failed to fetch token");
        }

        const { token: serverJws } = response.data;

        setLoomJWS(serverJws);

        const { supported, error } = isSupported();

        if (!supported) {
          console.warn(`Error setting up Loom: ${error}`);
          return;
        }
      } catch (error) {
        console.error("Error setting up Loom SDK:", error);
      }
    }
    setupLoomInitial();
  }, []);

  const handleSDKSetup = async () => {
    try {
      setSettingLoom(true);
      let configureSDK = {};

      // Initialize Loom SDK with the JWT and Public App ID
      configureSDK = await createInstance({
        mode: "custom",
        jws: loomJWS,
        publicAppId: LOOM_APP_ID,
        config: {
          disablePreviewModal: true,
          insertButtonText: "Save Video to Library",
        },
      });

      if (!configureSDK) {
        alert("Error setting up Loom SDK");
        return;
      }

      setSettingLoom(false);
      setShowStartRecordingBtn(true);

      const button = document.getElementById(BUTTON_ID);

      if (!button) {
        console.error(`Button with ID ${BUTTON_ID} not found`);
        return;
      }
      const sdkButton = configureSDK.configureButton({
        element: button,
      });

      sdkButton.on("insert-click", async (LoomVideo) => {
        setLoading(true);
        const videoData = {
          title: recordingName || LoomVideo.title,
          embeddedLink: LoomVideo.embedUrl || "",
          shareableLink: LoomVideo.sharedUrl || "",
        };
        try {
          const response = await saveRecordedVideo(videoData);

          if (response.success) {
            // Directly add the new video at the beginning of the array
            const updatedVideosData = [
              response.data.video,
              ...videosData.recordedVideos,
            ];

            // Update the state with the new videos data
            setVideosData({
              ...videosData,
              recordedVideos: updatedVideosData,
            });
          } else {
            console.error(
              "Error saving video to Database:",
              response.error || "Unknown error"
            );
          }
          setLoading(false);
        } catch (error) {
          console.error(
            "Error saving video:",
            error.response || error.message || error
          );
          setLoading(false);
        }

        setShowStartRecordingBtn(false);
        setSettingLoom(false);
      });
      // Event emitted when video capture has begun (after 3..2..1 countdown)
      sdkButton.on("recording-start", () => {
        afterRecordingStart();
      });
      // sdkButton.on("recording-complete", async (LoomVideo) => {
      //   console.log("Recording Completed", LoomVideo);
      // });
      // Event emitted when user has selected start recording
      sdkButton.on("start", () => {
        onStartRecording();
      });
    } catch (error) {
      console.error("Error Configuring the Btn:", error);
    }
  };

  return (
    <>
      <button
        className={`${
          disabled || settingLoom
            ? "bg-[#CBCBCB] hover:cursor-not-allowed"
            : "bg-primary hover:cursor-pointer"
        } text-white border-none p-[8px_16px] text-[16px] font-medium rounded-[8px] ${
          showStartRecordingBtn ? "hidden" : "block"
        }`}
        type="button"
        disabled={disabled || settingLoom}
        onClick={handleSDKSetup}
      >
        {settingLoom ? "Saving Name..." : "Next"}
      </button>
      <button
        id="start-recording-button"
        className={`bg-primary hover:cursor-pointer text-white border-none p-[8px_16px] text-[16px] font-medium rounded-[8px] ${
          showStartRecordingBtn ? "block" : "hidden"
        }`}
        type="button"
        onClick={handleSDKSetup}
      >
        Start Recording
      </button>
    </>
  );
};

export const LibraryBody = ({ children }) => {
  return <section className="mt-[24px]">{children}</section>;
};

export const BodyTabsRoot = ({ children }) => {
  return (
    <Tabs color="#2A85FF" defaultValue="videos">
      {children}
    </Tabs>
  );
};

export const VideoTabSection = ({ children, heading }) => {
  return (
    <div className="mt-[32px]">
      <h2 className="text-[18px] font-medium">{heading}</h2>
      {children}
    </div>
  );
};

export const VideoTabItemsList = ({ children }) => {
  return (
    <div className="grid xxxl:grid-cols-6 xxl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-[24px] mt-[16px]">
      {children}
    </div>
  );
};

export const VideoTabItem = ({ videoData }) => {
  // const pagePath = window.location.pathname.split("/")[1];
  const pageLocation = useLocation();

  const setIsDeleteVideoModalOpen = useGlobalModals(
    (state) => state.setIsDeleteVideoModalOpen
  );
  const setIsEditVideoModalOpen = useGlobalModals(
    (state) => state.setIsEditVideoModalOpen
  );
  const setIsShareVideoModalOpen = useGlobalModals(
    (state) => state.setIsShareVideoModalOpen
  );
  const setVideoToBeDeleted = useGlobalModals(
    (state) => state.setVideoToBeDeleted
  );
  const setVideoToBeEdited = useGlobalModals(
    (state) => state.setVideoToBeEdited
  );
  const setVideoToBeShared = useGlobalModals(
    (state) => state.setVideoToBeShared
  );

  return (
    <div className="flex flex-col border border-[#CFCED4] rounded-[16px] relative min-w-[250px] h-[210px] overflow-hidden hover:cursor-pointer">
      <div className={`h-[160px] relative`}>
        {videoData?.embeddedLink && (
          <iframe
            width="100%"
            height="100%"
            src={videoData?.embeddedLink}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        )}
        {!videoData?.embeddedLink && (
          <img
            src="./imagePlaceholder.jpeg"
            alt="Video Thumbnail"
            className="w-full h-full object-cover"
          />
        )}

        <button
          className="absolute top-[8px] right-[8px] cursor-pointer bg-primary rounded-full p-[4px_8px] hover:cursor-pointer flex gap-[4px] items-center text-white"
          onClick={() => {
            setVideoToBeShared(videoData);
            setIsShareVideoModalOpen(true);
          }}
        >
          <p className="text-[14px] font-medium">Share</p>
          <SHAREVIDEO_ICON />
        </button>
      </div>
      <div className="flex-grow px-[16px] py-[12px] flex items-center justify-between gap-[10px] border-t border-t-[#CFCED4]">
        <Link
          to={`video-detail/${videoData._id}`}
          className="text-[14px] font-medium line-clamp-1"
        >
          {videoData.title}
        </Link>
        <Menu
          shadow="md"
          width={150}
          position="bottom-end"
          arrowPosition="center"
          radius={12}
          offset={-5}
          styles={{
            menu: {
              padding: "8px 12px !important",
            },
            itemLabel: {
              fontSize: "14px",
              fontWeight: 500,
            },
          }}
        >
          <Menu.Target>
            <div className="w-[24px] h-[24px] flex justify-center items-center">
              <VIDEO_OPTIONS_ICON />
            </div>
          </Menu.Target>
          <Menu.Dropdown>
            {pageLocation.pathname.split("/")[1] === "recordings" && (
              <Menu.Item>
                <CopyButton value={videoData?.shareableLink}>
                  {({ copy }) => (
                    <div onClick={copy} className="flex items-center gap-[8px]">
                      <COPY_ICON className="text-black" />
                      <p className="text-[14px] font-medium">Copy Link</p>
                    </div>
                  )}
                </CopyButton>
              </Menu.Item>
            )}
            <Menu.Item
              leftSection={<SHARE_ICON className="text-black" />}
              onClick={() => {
                setVideoToBeShared(videoData);
                setIsShareVideoModalOpen(true);
              }}
            >
              Share
            </Menu.Item>
            <Menu.Item
              leftSection={<EDIT_ICON className="text-black" />}
              onClick={() => {
                setVideoToBeEdited(videoData);
                setIsEditVideoModalOpen(true);
              }}
            >
              Edit
            </Menu.Item>
            <Menu.Item
              color="red"
              leftSection={<DELETE_ICON className="text-[#FF0000]" />}
              onClick={() => {
                setVideoToBeDeleted(videoData);
                setIsDeleteVideoModalOpen(true);
              }}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
};

export const UploadedVideoTabItem = ({ videoData }) => {
  const setIsShareVideoModalOpen = useGlobalModals(
    (state) => state.setIsShareVideoModalOpen
  );

  const setVideoToBeShared = useGlobalModals(
    (state) => state.setVideoToBeShared
  );

  return (
    <div className="flex flex-col border border-[#CFCED4] rounded-[16px] relative min-w-[250px] h-[210px] overflow-hidden hover:cursor-pointer">
      <div className={`h-[160px] relative`}>
        {videoData?.embeddedLink && (
          <iframe
            width="100%"
            height="100%"
            src={videoData?.embeddedLink}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        )}
        {!videoData?.embeddedLink && (
          <img
            src="./imagePlaceholder.jpeg"
            alt="Video Thumbnail"
            className="w-full h-full object-cover"
          />
        )}

        <button
          className="absolute top-[8px] right-[8px] cursor-pointer bg-primary rounded-full p-[4px_8px] hover:cursor-pointer flex gap-[4px] items-center text-white"
          onClick={() => {
            setVideoToBeShared(videoData);
            setIsShareVideoModalOpen(true);
          }}
        >
          <p className="text-[14px] font-medium">Share</p>
          <SHAREVIDEO_ICON />
        </button>
      </div>
      <div className="flex-grow px-[16px] py-[12px] flex items-center justify-between gap-[10px] border-t border-t-[#CFCED4]">
        <Link
          to="uploaded-video-detail"
          className="text-[14px] font-medium line-clamp-1"
          onClick={() => {
            localStorage.setItem(
              "uploadedVideoDetail",
              JSON.stringify(videoData)
            );
          }}
        >
          {videoData.title}
        </Link>
      </div>
    </div>
  );
};

export const HistoryTabSection = ({ children }) => {
  return (
    <div
      className="mt-[32px] !max-h-[calc(100vh-264px)] overflow-auto"
      id="historyTabSection"
    >
      {children}
    </div>
  );
};

export const HistoryTableList = () => {
  const historyData = useUserStore((state) => state.historyData);

  // Sort the history data such that the most recent history is at the top
  const sortedHistoryData = historyData.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const rows = sortedHistoryData.map((element) => {
    const formattedDate = Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(element?.createdAt));

    return (
      <Table.Tr key={element._id}>
        <Table.Td className=" text-[14px] font-medium">
          {element?.videoTitle}
        </Table.Td>
        <Table.Td className=" text-[14px] font-medium capitalize">
          {(() => {
            if (!element?.contactName) return "";

            // Split the name into parts
            const nameParts = element?.contactName
              ?.split(" ")
              ?.filter((part) => part?.toLowerCase() !== "null");

            // Join the valid parts back or return an empty string if nothing is left
            return nameParts.length > 0 ? nameParts?.join(" ") : "";
          })()}
        </Table.Td>
        <Table.Td className=" text-[14px] font-medium">
          {element?.contactAddress}
        </Table.Td>
        <Table.Td className=" text-[14px] font-medium">
          {element?.sendType}
        </Table.Td>
        <Table.Td className=" text-[14px] font-medium">
          {element?.subject}
        </Table.Td>{" "}
        <Table.Td className=" text-[14px] font-medium">
          {formattedDate}
        </Table.Td>
        <Table.Td>
          <div
            className={`${
              element?.status === "sent"
                ? "text-[#5AA63F] bg-[rgba(90,166,63,0.14)]"
                : "text-[#FF613E] bg-[rgba(255,97,62,0.14)]"
            } uppercase text-center text-[12px] font-medium py-[4px] px-[8px] rounded-[2px] w-fit`}
          >
            {element?.status}
          </div>
        </Table.Td>
      </Table.Tr>
    );
  });
  return (
    <Table
      striped
      highlightOnHover
      withRowBorders={false}
      stripedColor="#F4F9FF"
      verticalSpacing="12px"
    >
      <Table.Thead>
        <Table.Tr>
          {/* <Table.Th>Serial No</Table.Th> */}
          <Table.Th>Recording Name</Table.Th>
          <Table.Th>Contact Name</Table.Th>
          <Table.Th>Contact Address</Table.Th>
          <Table.Th>Type</Table.Th>
          <Table.Th>Subject</Table.Th>
          <Table.Th>Date</Table.Th>
          <Table.Th>Status</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};

export const TextEditor = forwardRef(
  ({ onTextChange, editorContent, setEditorContent }, ref) => {
    const videoToBeShared = useGlobalModals((state) => state.videoToBeShared);
    const tagsDropDownOpen = useGlobalModals((state) => state.tagsDropDownOpen);
    const customTagsDropDownOpen = useGlobalModals(
      (state) => state.customTagsDropDownOpen
    );
    const setTagsDropDownOpen = useGlobalModals(
      (state) => state.setTagsDropDownOpen
    );

    // const shortCodesSelected = useGlobalModals(
    //   (state) => state.shortCodesSelected
    // );

    // const setShortCodesSelected = useGlobalModals(
    //   (state) => state.setShortCodesSelected
    // );

    const containerRef = useRef(null);
    const onTextChangeRef = useRef(onTextChange);

    // const handleShortCodeGlobalState = (shortCode) => {
    //   const updatedShortCodes = [...shortCodesSelected, shortCode];
    //   // remove duplicates
    //   const uniqueShortCodes = [...new Set(updatedShortCodes)];

    //   setShortCodesSelected(uniqueShortCodes);
    // };

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
    });

    useEffect(() => {
      const container = containerRef.current;
      const editorContainer = container.appendChild(
        container.ownerDocument.createElement("div")
      );

      // Set the ID of the editorContainer
      editorContainer.id = "text-editor-container";

      const toolbarOptions = [
        // [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [
          {
            font: ["arial", "sansserif", "serif", "monospace"],
          },
        ],
        [{ align: [] }],
        ["bold", "italic", "underline", "strike"], // toggled buttons
        [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
        ["blockquote"],
      ];

      const quill = new Quill(editorContainer, {
        theme: "snow",
        placeholder: "Write something...",
        modules: {
          toolbar: toolbarOptions,
        },
      });

      if (!editorContent) {
        const videoLink = `${videoToBeShared?.shareableLink}`;

        // Create the image tag with width and height if thumbnailURL is not empty
        const width = "300px"; // You can modify this to any value or make it dynamic
        const height = "200px"; // Modify this as well
        let videoThumbnail = "";

        // Check if thumbnailURL is not empty
        if (
          videoToBeShared?.thumbnailURL &&
          videoToBeShared?.thumbnailURL !== ""
        ) {
          videoThumbnail = `<img src="${videoToBeShared.thumbnailURL}" width="${width}" height="${height}" />`;
        }

        // Insert two line breaks at the beginning
        quill.insertText(0, "\n\n");

        // Insert the video link (bold) after "Video Link:"
        quill.insertText(2, videoLink, { bold: true, color: "blue" });
        // Optionally, move the cursor to a new line after the video link
        quill.insertText(2 + videoLink.length, "\n");

        // Insert the thumbnail if it exists, otherwise just insert the link
        if (videoThumbnail) {
          quill.clipboard.dangerouslyPasteHTML(
            2 + videoLink.length + 1,
            videoThumbnail
          );
          // Optionally, move the cursor to a new line after the video link and thumbnail
          quill.insertText(
            3 + videoLink.length + videoThumbnail.length,
            "\n\n"
          );
        }
      }

      // Toolbar Custom Options
      // Get the toolbar container
      const toolbar = quill.getModule("toolbar");

      // Create a wrapper for custom buttons
      const customButtonsWrapper = document.createElement("div");
      customButtonsWrapper.id = "custom-buttons-wrapper";

      const pasteLinkButton = document.createElement("button");
      pasteLinkButton.innerHTML = `<div style="display: flex; align-items: center; gap: 4px; white-space: nowrap;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="20" height="20"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z" fill="currentColor"/></svg><p style="margin: 0; line-height: normal;">Paste Video Link</p></div>`;
      pasteLinkButton.setAttribute("type", "button");

      pasteLinkButton.onclick = () => {
        // Set the width and height
        const width = "300px"; // You can modify this to any value or make it dynamic
        const height = "200px"; // Modify this as well
        let videoThumbnail = "";

        if (
          videoToBeShared?.thumbnailURL &&
          videoToBeShared?.thumbnailURL !== ""
        ) {
          // Create the image tag with width and height
          videoThumbnail = `<img src="${videoToBeShared.thumbnailURL}" width="${width}" height="${height}" />`;
        }

        // Paste the video link into the editor
        const range = quill.getSelection();

        if (range === null) {
          const videoLink = `${videoToBeShared?.shareableLink}`;

          if (!videoLink) {
            console.error("Video link is missing.");
            return; // Exit early if the video link is not available
          }

          // Insert the video link at the beginning with formatting
          quill.insertText(0, videoLink, {
            bold: true,
            color: "blue",
          });

          if (videoThumbnail) {
            quill.clipboard.dangerouslyPasteHTML(
              videoLink.length + 1,
              videoThumbnail
            );

            // Add a new line after the image for separation
            quill.insertText(
              videoLink.length + 1 + videoThumbnail?.length,
              "\n\n"
            );
          }
        } else {
          // Adding a space before and after the link
          const updatedVideoLink = ` ${videoToBeShared?.shareableLink} `;

          if (!updatedVideoLink.trim()) {
            console.error("Updated video link is missing.");
            return; // Exit early if the video link is not available
          }

          // Insert the link with formatting at the specified range
          quill.insertText(range.index, updatedVideoLink, {
            bold: true,
            color: "blue",
          });

          quill.insertText(range.index + updatedVideoLink.length, "\n");

          if (videoThumbnail) {
            // Insert the image after the video link
            quill.clipboard.dangerouslyPasteHTML(
              range.index + updatedVideoLink.length + 1,
              videoThumbnail
            );

            // Add a new line after the image for separation
            quill.insertText(
              range.index + updatedVideoLink.length + videoThumbnail?.length,
              "\n\n"
            );

            // Move the cursor to the end of the inserted link and image
            quill.setSelection(
              range.index + updatedVideoLink.length + videoThumbnail?.length + 2
            );
          }
        }
      };

      // const pasteThumbnailButton = document.createElement("button");
      // pasteThumbnailButton.innerHTML = `<div style="display: flex; align-items: center; gap: 4px; white-space: nowrap;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M448 80c8.8 0 16 7.2 16 16l0 319.8-5-6.5-136-176c-4.5-5.9-11.6-9.3-19-9.3s-14.4 3.4-19 9.3L202 340.7l-30.5-42.7C167 291.7 159.8 288 152 288s-15 3.7-19.5 10.1l-80 112L48 416.3l0-.3L48 96c0-8.8 7.2-16 16-16l384 0zM64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zm80 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z" fill="currentColor"/></svg><p style="margin: 0; line-height: normal;">Paste Thumbnail</p></div>`;
      // pasteThumbnailButton.setAttribute("type", "button");

      // pasteThumbnailButton.onclick = () => {
      //   // Set the width and height
      //   const width = "300px"; // You can modify this to any value or make it dynamic
      //   const height = "200px"; // Modify this as well

      //   // Create the image tag with width and height
      //   const imageTag = `<img src="${videoToBeShared.thumbnailURL}" width="${width}" height="${height}" />`;

      //   const range = quill.getSelection();
      //   if (range === null) {
      //     // Insert the image at the current cursor position
      //     quill.clipboard.dangerouslyPasteHTML(0, imageTag);
      //     // Move the cursor to the end of the inserted image
      //     quill.setSelection(0 + imageTag.length);
      //   }

      //   // Insert the image at the current cursor position
      //   quill.clipboard.dangerouslyPasteHTML(range.index, imageTag);
      //   // Move the cursor to the end of the inserted image
      //   quill.setSelection(range.index + imageTag.length);
      // };

      const firstNameShortCodeBtn = document.createElement("button");
      firstNameShortCodeBtn.innerHTML = `<p style="margin: 0 5px; line-height: normal;">Add First Name</p>`;
      firstNameShortCodeBtn.setAttribute("type", "button");
      firstNameShortCodeBtn.onclick = () => {
        const firstNameShortCode = "{{contact.first_name}}";
        const range = quill.getSelection();
        if (range === null) {
          // Insert the image at the current cursor position
          quill.clipboard.dangerouslyPasteHTML(0, firstNameShortCode);
          // Move the cursor to the end of the inserted image
          quill.setSelection(0 + firstNameShortCode.length);
        } else {
          // Insert the image at the current cursor position
          quill.clipboard.dangerouslyPasteHTML(range.index, firstNameShortCode);
          // Move the cursor to the end of the inserted image
          quill.setSelection(range.index + firstNameShortCode.length);
        }

        // handle udpate the shortCodesSelected
        // handleShortCodeGlobalState(firstNameShortCode);
      };

      const userSignatureBtn = document.createElement("button");
      userSignatureBtn.innerHTML = `
      <div style="display: flex; align-items: center; gap: 4px; white-space: nowrap;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="18" height="18"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M192 128c0-17.7 14.3-32 32-32s32 14.3 32 32l0 7.8c0 27.7-2.4 55.3-7.1 82.5l-84.4 25.3c-40.6 12.2-68.4 49.6-68.4 92l0 71.9c0 40 32.5 72.5 72.5 72.5c26 0 50-13.9 62.9-36.5l13.9-24.3c26.8-47 46.5-97.7 58.4-150.5l94.4-28.3-12.5 37.5c-3.3 9.8-1.6 20.5 4.4 28.8s15.7 13.3 26 13.3l128 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-83.6 0 18-53.9c3.8-11.3 .9-23.8-7.4-32.4s-20.7-11.8-32.2-8.4L316.4 198.1c2.4-20.7 3.6-41.4 3.6-62.3l0-7.8c0-53-43-96-96-96s-96 43-96 96l0 32c0 17.7 14.3 32 32 32s32-14.3 32-32l0-32zm-9.2 177l49-14.7c-10.4 33.8-24.5 66.4-42.1 97.2l-13.9 24.3c-1.5 2.6-4.3 4.3-7.4 4.3c-4.7 0-8.5-3.8-8.5-8.5l0-71.9c0-14.1 9.3-26.6 22.8-30.7zM24 368c-13.3 0-24 10.7-24 24s10.7 24 24 24l40.3 0c-.2-2.8-.3-5.6-.3-8.5L64 368l-40 0zm592 48c13.3 0 24-10.7 24-24s-10.7-24-24-24l-310.1 0c-6.7 16.3-14.2 32.3-22.3 48L616 416z" fill="currentColor"/></svg><p style="margin: 0 5px; line-height: normal;">Add Signature</p></div>`;
      userSignatureBtn.setAttribute("type", "button");
      userSignatureBtn.onclick = () => {
        const userSignatureShortCode = "{{user.email_signature}}";
        const range = quill.getSelection();
        if (range === null) {
          // Insert the image at the current cursor position
          quill.clipboard.dangerouslyPasteHTML(0, userSignatureShortCode);
          // Move the cursor to the end of the inserted image
          quill.setSelection(0 + userSignatureShortCode.length);
        } else {
          // Insert the image at the current cursor position
          quill.clipboard.dangerouslyPasteHTML(
            range.index,
            userSignatureShortCode
          );
          // Move the cursor to the end of the inserted image
          quill.setSelection(range.index + userSignatureShortCode.length);
        }

        // handle udpate the shortCodesSelected
        // handleShortCodeGlobalState(firstNameShortCode);
      };

      // Style and append custom buttons to the wrapper
      [pasteLinkButton].forEach((btn) => {
        btn.classList.add("ql-formats");
        customButtonsWrapper.appendChild(btn);
      });

      const tagsButtonWrapper = document.createElement("div");
      tagsButtonWrapper.id = "tag-button-wrapper";

      const tagButton = document.createElement("button");
      tagButton.innerHTML = `
      <div style="display: flex; align-items: center; gap: 4px; white-space: nowrap;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="18" height="18" aria-hidden="true">
            <path d="M0 80L0 229.5c0 17 6.7 33.3 18.7 45.3l176 176c25 25 65.5 25 90.5 0L418.7 317.3c25-25 25-65.5 0-90.5l-176-176c-12-12-28.3-18.7-45.3-18.7L48 32C21.5 32 0 53.5 0 80zm112 32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" fill="currentColor"/>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="10" height="10"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z" fill="currentColor"/></svg>
          </div>
        `;
      tagButton.onclick = () => {
        setTagsDropDownOpen(!tagsDropDownOpen);
      };
      tagButton.setAttribute("type", "button");

      // Style and append custom buttons to the wrapper
      [tagButton, firstNameShortCodeBtn, userSignatureBtn].forEach((btn) => {
        btn.classList.add("ql-formats");
        tagsButtonWrapper.appendChild(btn);
      });

      // Add custom buttons wrapper to the toolbar
      toolbar.container.insertBefore(
        tagsButtonWrapper,
        toolbar.container.firstChild
      );

      // Append the wrapper to the toolbar
      toolbar.container.appendChild(customButtonsWrapper);

      // Restore editor content if available
      if (editorContent) {
        quill.setContents(editorContent);
      }

      ref.current = quill;

      quill.on(Quill.events.TEXT_CHANGE, (...args) => {
        setEditorContent(quill.getContents());
        onTextChangeRef.current?.(...args);
      });

      return () => {
        ref.current = null;
        container.innerHTML = "";
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref]);

    return (
      <div className="flex flex-col gap-[8px] relative">
        {tagsDropDownOpen && <SelectContactShortCodeDropDown quillRef={ref} />}
        {customTagsDropDownOpen && (
          <SelectCustomShortCodeDropDown quillRef={ref} />
        )}
        <p className="text-[14px] font-medium">Email Content</p>
        <div
          ref={containerRef}
          className="h-[246px] overflow-hidden flex flex-col"
          id="text-editor-mainContainer"
        ></div>
      </div>
    );
  }
);

const SelectContactShortCodeDropDown = ({ quillRef }) => {
  const shortCodesData = [
    {
      id: 1,
      name: "Full Name",
      value: "{{contact.name}}",
    },
    {
      id: 2,
      name: "First Name",
      value: "{{contact.first_name}}",
    },
    {
      id: 3,
      name: "Last Name",
      value: "{{contact.last_name}}",
    },
    {
      id: 4,
      name: "Email",
      value: "{{contact.email}}",
    },
    {
      id: 5,
      name: "Phone",
      value: "{{contact.phone}}",
    },
    {
      id: 6,
      name: "Company Name",
      value: "{{contact.company_name}}",
    },
    {
      id: 7,
      name: "Full Address",
      value: "{{contact.full_address}}",
    },
    {
      id: 8,
      name: "City",
      value: "{{contact.city}}",
    },
    {
      id: 9,
      name: "State",
      value: "{{contact.state}}",
    },
    {
      id: 10,
      name: "Country",
      value: "{{contact.country}}",
    },
    {
      id: 11,
      name: "Postal Code",
      value: "{{contact.postal_code}}",
    },
    {
      id: 12,
      name: "Date of Birth",
      value: "{{contact.date_of_birth}}",
    },
    {
      id: 13,
      name: "Source",
      value: "{{contact.source}}",
    },
  ];

  // shortCodes Tags Data
  const tagsDropDownOpen = useGlobalModals((state) => state.tagsDropDownOpen);
  const setTagsDropDownOpen = useGlobalModals(
    (state) => state.setTagsDropDownOpen
  );
  const setCustomTagsDropDownOpen = useGlobalModals(
    (state) => state.setCustomTagsDropDownOpen
  );
  const setShortCodesSelected = useGlobalModals(
    (state) => state.setShortCodesSelected
  );

  const shortCodesSelected = useGlobalModals(
    (state) => state.shortCodesSelected
  );
  const dropDownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
        setTagsDropDownOpen(false); // Close the dropdown
      }
    };

    if (tagsDropDownOpen) {
      // Add the event listener only when the dropdown is open
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup: Remove the event listener when the dropdown closes
    return () => {
      if (tagsDropDownOpen) {
        document.removeEventListener("mousedown", handleClickOutside);
      }
    };
  }, [tagsDropDownOpen, setTagsDropDownOpen]);

  const handleSelectContactShortCode = (e) => {
    const selectedShortCode = e.target.innerText;
    const selectedShortCodeValue = shortCodesData.find(
      (tag) => tag.name === selectedShortCode
    ).value;

    const quill = quillRef.current;
    const quillContent = quill.getContents();
    const textLength = quill.getLength();
    const shortCodeValue = selectedShortCodeValue;

    const updatedShortCodes = [...shortCodesSelected, selectedShortCodeValue];
    // remove duplicates
    const uniqueShortCodes = [...new Set(updatedShortCodes)];

    setShortCodesSelected(uniqueShortCodes);

    if (quillContent.ops.length === 1 && quillContent.ops[0].insert === "\n") {
      quill.insertText(0, shortCodeValue);

      quill.setSelection(textLength - 1 + shortCodeValue.length);
    } else {
      // Insert the Short Code with formatting
      quill.insertText(textLength - 1, shortCodeValue);

      // Move the cursor to the end of the inserted Short Code
      quill.setSelection(textLength + shortCodeValue.length);
    }

    setTagsDropDownOpen(false);
  };

  return (
    <div
      id="shortCodesDropDownWrapper"
      ref={dropDownRef}
      className={`h-[180px] w-[200px] rounded-[8px] flex flex-col gap-[4px] bg-white shadow-md absolute z-[1000] top-[80px] left-[10px] py-[8px] ps-[8px] ${
        tagsDropDownOpen ? "block" : "hidden"
      }`}
    >
      <div
        className="h-full w-full overflow-auto pr-[6px] flex flex-col gap-[8px]"
        id="shortCodeDropDown-content"
      >
        {shortCodesData.map((tag) => (
          <div
            key={tag.id}
            className="p-[8px] hover:bg-[#F7F7F8] cursor-pointer rounded-[4px] text-[14px]"
            onClick={handleSelectContactShortCode}
          >
            {tag.name}
          </div>
        ))}

        <button
          type="button"
          onClick={() => {
            setTagsDropDownOpen(false);
            setCustomTagsDropDownOpen(true);
          }}
          className="flex items-center justify-between p-[8px] hover:bg-[#F7F7F8] cursor-pointer rounded-[4px]"
        >
          <p className="text-[16px] font-bold">Custom Fields</p>
          <ARROW_RIGHT className="!text-[14px] text-black" />
        </button>
      </div>
    </div>
  );
};

const SelectCustomShortCodeDropDown = ({ quillRef }) => {
  // shortCodes Tags Data
  const customTagsDropDownOpen = useGlobalModals(
    (state) => state.customTagsDropDownOpen
  );
  const customFieldsData = useGlobalModals((state) => state.customFieldsData);
  const setTagsDropDownOpen = useGlobalModals(
    (state) => state.setTagsDropDownOpen
  );
  const setCustomTagsDropDownOpen = useGlobalModals(
    (state) => state.setCustomTagsDropDownOpen
  );
  // const setCustomFieldsSelected = useGlobalModals(
  //   (state) => state.setCustomFieldsSelected
  // );

  // const customFieldsSelected = useGlobalModals(
  //   (state) => state.customFieldsSelected
  // );
  const dropDownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
        setCustomTagsDropDownOpen(false); // Close the dropdown
      }
    };

    if (customTagsDropDownOpen) {
      // Add the event listener only when the dropdown is open
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup: Remove the event listener when the dropdown closes
    return () => {
      if (customTagsDropDownOpen) {
        document.removeEventListener("mousedown", handleClickOutside);
      }
    };
  }, [customTagsDropDownOpen, setCustomTagsDropDownOpen]);

  const customShortCodesData = customFieldsData.map((tag) => ({
    id: tag.id,
    name: tag.name,
    value: `{{${tag.fieldKey}}}`,
  }));

  const handleSelectCustomShortCode = (e) => {
    const selectedShortCode = e.target.innerText;
    const selectedShortCodeValue = customShortCodesData.find(
      (tag) => tag.name === selectedShortCode
    ).value;
    // const selectedShortCodeId = customShortCodesData.find(
    //   (tag) => tag.name === selectedShortCode
    // ).id;

    const quill = quillRef.current;
    const quillContent = quill.getContents();
    const textLength = quill.getLength();
    const shortCodeValue = selectedShortCodeValue;

    // const selectedShortCodeObject = {
    //   id: selectedShortCodeId,
    //   name: selectedShortCodeValue,
    // };

    // const updatedShortCodes = [
    //   ...customFieldsSelected,
    //   selectedShortCodeObject,
    // ];
    // remove duplicates
    // const uniqueShortCodes = [...new Set(updatedShortCodes)];

    // setCustomFieldsSelected(uniqueShortCodes);

    if (quillContent.ops.length === 1 && quillContent.ops[0].insert === "\n") {
      quill.insertText(0, shortCodeValue);

      quill.setSelection(textLength - 1 + shortCodeValue.length);
    } else {
      // Insert the Short Code with formatting
      quill.insertText(textLength - 1, shortCodeValue);

      // Move the cursor to the end of the inserted Short Code
      quill.setSelection(textLength + shortCodeValue.length);
    }

    setCustomTagsDropDownOpen(false);
  };

  return (
    <div
      id="shortCodesDropDownWrapper"
      ref={dropDownRef}
      className={`h-[180px] w-[200px] rounded-[8px] flex flex-col gap-[4px] bg-white shadow-md absolute z-[1000] top-[80px] left-[10px] py-[8px] ps-[8px] ${
        customTagsDropDownOpen ? "block" : "hidden"
      }`}
    >
      <div
        className="h-full w-full overflow-auto pr-[6px] flex flex-col gap-[8px]"
        id="shortCodeDropDown-content"
      >
        <div className="py-[8px] flex flex-col gap-[8px]">
          <button
            type="button"
            onClick={() => {
              setCustomTagsDropDownOpen(false);
              setTagsDropDownOpen(true);
            }}
            className="flex items-center gap-[8px] w-fit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              width="14px"
              height="14px"
            >
              <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
            </svg>
            <p className="text-[14px] font-bold">Go Back</p>
          </button>
          <Divider />
        </div>

        {customShortCodesData.map((tag) => (
          <div key={tag.id}>
            <div
              key={tag.id}
              className="p-[8px] hover:bg-[#F7F7F8] cursor-pointer rounded-[4px] text-[14px]"
              onClick={handleSelectCustomShortCode}
            >
              {tag.name}
            </div>
          </div>
        ))}

        {customShortCodesData.length === 0 && (
          <p className="text-gray-600 text-center p-[8px]">
            No Custom Fields Found!
          </p>
        )}
      </div>
    </div>
  );
};

TextEditor.displayName = "Editor";
