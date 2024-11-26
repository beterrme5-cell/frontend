import CustomButton from "./CustomButton";
import ShareVideoIcon from "../../assets/icons/shareVideoIcon.svg";
import VideoOptionsIcon from "../../assets/icons/VideoOptionsIcon.svg";
import CopyIcon from "../../assets/icons/copy-icon.svg";
import ShareIcon from "../../assets/icons/share-icon.svg";
import EditIcon from "../../assets/icons/edit-icon.svg";
import DeleteIcon from "../../assets/icons/delete-icon.svg";
import { Menu, Tabs, Table } from "@mantine/core";
import { useGlobalModals } from "../../store/globalModals";
import { Link, useLocation } from "react-router-dom";
import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import Quill from "quill";
import { createInstance } from "@loomhq/record-sdk";
import { isSupported } from "@loomhq/record-sdk/is-supported";
import { saveRecordedVideo } from "../../api/libraryAPIs";
import axios from "axios";
import imagePlaceholder from "../../assets/imagePlaceholder.jpeg";
import { useUserStore } from "../../store/userStore";

export const LibraryRoot = ({ children }) => {
  return (
    <section className="bg-white p-[32px] rounded-[12px]">{children}</section>
  );
};

export const LibraryHeader = ({ title, onUploadVideoBtnClick }) => {
  const pageLocation = useLocation();

  return (
    <header className="flex items-center justify-between">
      <h1 className="text-[28px] font-bold ">{title}</h1>
      <div className="flex items-center gap-[12px]">
        <CustomButton
          onClick={onUploadVideoBtnClick}
          varient="outlined"
          label="Upload Video"
        />
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

    if (!accessToken) {
      console.error("Access Token not found");
      return;
    }

    // Set the access token in the local storage for the new tab

    // create a new tab and navigate to the new recording page
    const newTab = window.open(
      `https://3326-39-58-184-166.ngrok-free.app/recordings/${accessToken}`,
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
  newvideoFormData,
}) => {
  const BUTTON_ID = "start-recording-button";
  const videosData = useUserStore((state) => state.videosData);
  const setVideosData = useUserStore((state) => state.setVideosData);
  const LOOM_APP_ID = "d5dfdcdb-3445-443a-9fca-a61b0161a9ae";

  // Loom SDK Setup
  useEffect(() => {
    async function setupLoom() {
      try {
        // Fetch the signed JWT from the server
        const response = await axios.get("http://localhost:8000/setup");

        if (response.status !== 200) throw new Error("Failed to fetch token");
        const { token: serverJws } = response.data;

        const { supported, error } = isSupported();

        if (!supported) {
          console.warn(`Error setting up Loom: ${error}`);
          return;
        }

        // Initialize Loom SDK with the JWT and Public App ID
        const { configureButton } = await createInstance({
          mode: "custom",
          jws: serverJws,
          publicAppId: LOOM_APP_ID,
          config: {
            disablePreviewModal: true,
            insertButtonText: "Save Video to Library",
          },
        });

        const button = document.getElementById(BUTTON_ID);

        if (!button) {
          console.error(`Button with ID ${BUTTON_ID} not found`);
          return;
        }

        const sdkButton = configureButton({
          element: button,
        });

        sdkButton.on("insert-click", async (LoomVideo) => {
          const videoData = {
            title: newvideoFormData.recordingName || LoomVideo.title,
            embeddedLink: LoomVideo.embedUrl || "",
            shareableLink: LoomVideo.sharedUrl || "",
          };

          try {
            const response = await saveRecordedVideo(videoData);

            if (response.success) {
              const updatedVideosData = [...videosData, response.data.video];
              setVideosData(updatedVideosData);
            } else {
              console.error(
                "Error saving video to Database:",
                response.error || "Unknown error"
              );
            }
          } catch (error) {
            console.error(
              "Error saving video:",
              error.response || error.message || error
            );
          }
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
        console.error("Error setting up Loom SDK:", error);
      }
    }

    setupLoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setVideosData, videosData]);

  return (
    <button
      id="start-recording-button"
      className="bg-primary text-white border-none p-[8px_16px] text-[14px] font-medium rounded-[8px] hover:cursor-pointer"
      type="button"
    >
      Start Recording
    </button>
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
            src={imagePlaceholder}
            alt="Video Thumbnail"
            className="w-full h-full object-cover"
          />
        )}
        <img
          src={ShareVideoIcon}
          alt="Share Video Icon"
          className={`absolute top-[8px] right-[8px] cursor-pointer`}
          onClick={() => {
            setVideoToBeShared(videoData);
            setIsShareVideoModalOpen(true);
          }}
        />
      </div>
      <div className="flex-grow px-[16px] py-[12px] flex items-center justify-between gap-[10px] border-t border-t-[#CFCED4]">
        <Link
          to={`video-detail/${videoData._id}`}
          className="text-[14px] font-medium"
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
              <img src={VideoOptionsIcon} alt="Video Options Icon" />
            </div>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={
                <img src={CopyIcon} alt="Copy Icon" className="w-[20px]" />
              }
            >
              Copy Link
            </Menu.Item>
            <Menu.Item
              leftSection={
                <img src={ShareIcon} alt="Copy Icon" className="w-[20px]" />
              }
              onClick={() => {
                setVideoToBeShared(videoData);
                setIsShareVideoModalOpen(true);
              }}
            >
              Share
            </Menu.Item>
            <Menu.Item
              leftSection={
                <img src={EditIcon} alt="Copy Icon" className="w-[20px]" />
              }
              onClick={() => {
                setVideoToBeEdited(videoData);
                setIsEditVideoModalOpen(true);
              }}
            >
              Edit
            </Menu.Item>
            <Menu.Item
              color="red"
              leftSection={
                <img src={DeleteIcon} alt="Copy Icon" className="w-[20px]" />
              }
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

export const HistoryTabSection = ({ children }) => {
  return <div className="mt-[32px]">{children}</div>;
};

export const HistoryTableList = ({ historyData }) => {
  const rows = historyData.map((element) => (
    <Table.Tr key={element._id}>
      <Table.Td className=" text-[14px] font-medium">{element._id}</Table.Td>
      <Table.Td className=" text-[14px] font-medium">
        {element.recordingId}
      </Table.Td>
      <Table.Td className=" text-[14px] font-medium">
        {element.contactId}
      </Table.Td>
      <Table.Td className=" text-[14px] font-medium">
        {element.contactName}
      </Table.Td>
      <Table.Td className=" text-[14px] font-medium">{element.type}</Table.Td>
      <Table.Td className=" text-[14px] font-medium">
        {element.subject}
      </Table.Td>
      <Table.Td>{element.status}</Table.Td>
    </Table.Tr>
  ));
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
          <Table.Th>ID</Table.Th>
          <Table.Th>Recording ID</Table.Th>
          <Table.Th>Contact ID</Table.Th>
          <Table.Th>Contact Name</Table.Th>
          <Table.Th>Type</Table.Th>
          <Table.Th>Subject</Table.Th>
          <Table.Th>Status</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};

export const TextEditor = forwardRef(({ onTextChange }, ref) => {
  const videoToBeShared = useGlobalModals((state) => state.videoToBeShared);

  const containerRef = useRef(null);
  const onTextChangeRef = useRef(onTextChange);

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
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ align: [] }],
      ["bold", "italic", "underline", "strike"], // toggled buttons
      [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["blockquote"],
    ];

    const quill = new Quill(editorContainer, {
      theme: "snow",
      placeholder: "Write something...",
      modules: {
        toolbar: toolbarOptions,
      },
    });

    // Toolbar Custom Options
    // Get the toolbar container
    const toolbar = quill.getModule("toolbar");

    // Create a wrapper for custom buttons
    const customButtonsWrapper = document.createElement("div");
    customButtonsWrapper.id = "custom-buttons-wrapper";

    const pasteLinkButton = document.createElement("button");
    pasteLinkButton.innerHTML = "Paste Video Link";
    pasteLinkButton.setAttribute("type", "button");
    pasteLinkButton.onclick = () => {
      // Paste the video link into the editor
      const range = quill.getSelection();

      if (range === null) {
        const updatedVideoLink = `${videoToBeShared?.shareableLink} `;

        quill.insertText(0, updatedVideoLink, {
          bold: true,
        });

        return quill.setSelection(range.index + updatedVideoLink.length);
      }

      // Adding a space before and after the link
      const updatedVideoLink = ` ${videoToBeShared?.shareableLink} `;

      // Insert the link with formatting
      quill.insertText(range.index, updatedVideoLink, {
        bold: true,
      });

      // Move the cursor to the end of the inserted link
      quill.setSelection(range.index + updatedVideoLink.length);
    };

    const pasteThumbnailButton = document.createElement("button");
    pasteThumbnailButton.innerHTML = "Paste Thumbnail";
    pasteThumbnailButton.setAttribute("type", "button");
    pasteThumbnailButton.onclick = () => {
      console.log("Paste Thumbnail clicked", videoToBeShared);
    };

    // embedButton.classList.add("ql-formats");
    pasteLinkButton.classList.add("ql-formats");
    pasteThumbnailButton.classList.add("ql-formats");

    // Append custom buttons to the wrapper
    // customButtonsWrapper.appendChild(embedButton);
    customButtonsWrapper.appendChild(pasteLinkButton);
    customButtonsWrapper.appendChild(pasteThumbnailButton);

    // Append the wrapper to the toolbar
    toolbar.container.appendChild(customButtonsWrapper);

    ref.current = quill;

    quill.on(Quill.events.TEXT_CHANGE, (...args) => {
      onTextChangeRef.current?.(...args);
    });

    return () => {
      ref.current = null;
      container.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
  return (
    <div className="flex flex-col gap-[8px]">
      <p className="text-[14px] font-medium">Content</p>
      <div
        ref={containerRef}
        className="h-[350px] overflow-hidden flex flex-col"
        id="text-editor-mainContainer"
      ></div>
    </div>
  );
});

TextEditor.displayName = "Editor";
