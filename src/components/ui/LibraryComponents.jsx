import CustomButton from "./CustomButton";
import ShareVideoIcon from "../../assets/icons/shareVideoIcon.svg";
import VideoOptionsIcon from "../../assets/icons/VideoOptionsIcon.svg";
import ArrowDownIcon from "../../assets/icons/arrow-down.svg";
import CopyIcon from "../../assets/icons/copy-icon.svg";
import ShareIcon from "../../assets/icons/share-icon.svg";
import EditIcon from "../../assets/icons/edit-icon.svg";
import DeleteIcon from "../../assets/icons/delete-icon.svg";
import { Menu, Tabs, Table } from "@mantine/core";
import { useGlobalModals } from "../../store/globalModals";
import { Link } from "react-router-dom";
import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import Quill from "quill";
import { setup } from "@loomhq/record-sdk";
import { isSupported } from "@loomhq/record-sdk/is-supported";
import { saveRecordedVideo } from "../../api/libraryAPIs";
import axios from "axios";

export const LibraryRoot = ({ children }) => {
  return (
    <section className="bg-white p-[32px] rounded-[12px]">{children}</section>
  );
};

export const LibraryHeader = ({ title, onUploadVideoBtnClick }) => {
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-[28px] font-bold ">{title}</h1>
      <div className="flex items-center gap-[12px]">
        <CustomButton
          onClick={onUploadVideoBtnClick}
          varient="outlined"
          label="Upload Video"
        />
        <RecordLoomVideoBtn />
      </div>
    </header>
  );
};

const RecordLoomVideoBtn = () => {
  const BUTTON_ID = "loom-record-sdk-button";
  // const PUBLIC_APP_ID = "d5dfdcdb-3445-443a-9fca-a61b0161a9ae";

  // Loom SDK Setup
  useEffect(() => {
    async function setupLoom() {
      try {
        // Fetch the signed JWT from the server
        const response = await axios.get(
          "http://localhost:8000/get-loom-token"
        );

        if (response.status !== 200) throw new Error("Failed to fetch token");
        const { token: serverJws } = response.data;

        const { supported, error } = isSupported();

        if (!supported) {
          console.warn(`Error setting up Loom: ${error}`);
          return;
        }

        // Initialize Loom SDK with the JWT and Public App ID
        const { configureButton } = await setup({
          mode: "standard",
          jws: serverJws,
          config: {
            insertButtonText: "Save Video",
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
          console.log("LoomVideo", LoomVideo);

          const videoData = {
            accountId: "your-account-id",
            title: LoomVideo.title || "",
            embeddedLink: LoomVideo.embedUrl || "",
            shareableLink: LoomVideo.sharedUrl || "",
          };

          try {
            const response = await saveRecordedVideo(videoData);
            console.log("Video saved successfully", response.data);
            // setVideosUpdated((prev) => prev + 1);
          } catch (error) {
            console.error("Error saving video:", error.response);
          }
        });
      } catch (error) {
        console.error("Error setting up Loom SDK:", error);
      }
    }

    setupLoom();
  }, []);

  return (
    <button
      id="loom-record-sdk-button"
      className="bg-primary text-white border-none p-[8px_16px] text-[14px] font-medium rounded-[8px] hover:cursor-pointer"
    >
      Record Video
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
            src="https://s3-alpha-sig.figma.com/img/8238/d197/077f40948736f63966988f296dc35cdc?Expires=1731888000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=SIW80GJs~r3Ieu~r0i1Ki5DSyrHjLMUafaUBQVmPJM5i8Idxtq~OVbCpiUtiRjY92LK5xCQg~PJq7r7GZW3QOO0BgQJKUGvs7SE0yPX8l5mVuXdTa0iyNSJ1C~hkHpF4OSFvFdy11oObQ9Y~l5SvMw4Z2FE5IZ7QqARtVWCC~x9zit5NbGdg0muVDYuBsXv~Xgmd1BWXxzIkYFXrCCFS~lqePGiAMIiuJwFXD7NjB8bsnt4MMhfeIVY4zg2jjWUJABr-48PIoMjvOfOv~hVS-j4ud4LpgmPfkMEGDMacGA7QIGXceF7saDJTuls8ZBag4y31VDFNj7Nf9pwBWE8Bsw__"
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
      <Table.Td>
        <button
          className="flex items-center gap-[4px]"
          type="button"
          onClick={() => {
            alert("Table Row Expand");
          }}
        >
          <p className="text-[14px] font-medium">Expand</p>
          <img src={ArrowDownIcon} alt="Arrow Down Icon" />
        </button>
      </Table.Td>
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
          <Table.Th>Action</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
};

export const TextEditor = forwardRef(({ onTextChange }, ref) => {
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

    // Add custom buttons to the toolbar
    const embedButton = document.createElement("button");
    embedButton.innerHTML = "Embed Video";
    embedButton.setAttribute("type", "button");
    embedButton.onclick = () => {
      // Define what happens when the "Embed Video" button is clicked
      console.log("Embed Video clicked");
    };

    const pasteLinkButton = document.createElement("button");
    pasteLinkButton.innerHTML = "Paste Video Link";
    pasteLinkButton.setAttribute("type", "button");
    pasteLinkButton.onclick = () => {
      // Define what happens when the "Paste Video Link" button is clicked
      console.log("Paste Video Link clicked");
    };

    const pasteThumbnailButton = document.createElement("button");
    pasteThumbnailButton.innerHTML = "Paste Thumbnail";
    pasteThumbnailButton.setAttribute("type", "button");
    pasteThumbnailButton.onclick = () => {
      // Define what happens when the "Paste Thumbnail" button is clicked
      console.log("Paste Thumbnail clicked");
    };

    embedButton.classList.add("ql-formats");
    pasteLinkButton.classList.add("ql-formats");
    pasteThumbnailButton.classList.add("ql-formats");

    // Append custom buttons to the wrapper
    customButtonsWrapper.appendChild(embedButton);
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
