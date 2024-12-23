import { Menu, Tabs, Table, CopyButton } from "@mantine/core";
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
  COPY_ICON,
  DELETE_ICON,
  EDIT_ICON,
  SHARE_ICON,
  SHAREVIDEO_ICON,
  VIDEO_OPTIONS_ICON,
} from "../../assets/icons/DynamicIcons";
import { useLoadingBackdrop } from "./../../store/loadingBackdrop";

export const LibraryRoot = ({ children }) => {
  return (
    <section className="bg-white p-[32px] rounded-[12px]">{children}</section>
  );
};

export const LibraryHeader = ({ title }) => {
  const pageLocation = useLocation();

  const userLocationId = localStorage.getItem("userLocationId");

  return (
    <header className="flex items-center justify-between">
      <h1 className="text-[28px] font-bold ">{title}</h1>
      <div className="flex items-center gap-[12px]">
        <a
          href={`https://app.gohighlevel.com/v2/location/${userLocationId}/media-storage`}
          className="p-[8px_16px] text-[14px] font-medium rounded-[8px] bg-white border border-gray-dark text-darkBlue"
          target="_blank"
        >
          Upload Video
        </a>
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
            const updatedVideosData = [...videosData, response.data.video];
            setVideosData(updatedVideosData);
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
              <VIDEO_OPTIONS_ICON />
            </div>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item>
              <CopyButton value={videoData?.shareableLink}>
                {({ copy }) => (
                  <buttton
                    onClick={copy}
                    className="flex items-center gap-[8px]"
                  >
                    <COPY_ICON className="text-black" />
                    <p className="text-[14px] font-medium">Copy Link</p>
                  </buttton>
                )}
              </CopyButton>
            </Menu.Item>
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

  const rows = historyData.map((element) => (
    <Table.Tr key={element._id}>
      <Table.Td className=" text-[14px] font-medium">
        {element?.videoTitle}
      </Table.Td>
      <Table.Td className=" text-[14px] font-medium">
        {element?.contactName}
      </Table.Td>
      <Table.Td className=" text-[14px] font-medium">
        {element?.contactAddress}
      </Table.Td>
      <Table.Td className=" text-[14px] font-medium">
        {element?.sendType}
      </Table.Td>
      <Table.Td className=" text-[14px] font-medium">
        {element?.subject}
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
          {/* <Table.Th>Serial No</Table.Th> */}
          <Table.Th>Recording Name</Table.Th>
          <Table.Th>Contact Name</Table.Th>
          <Table.Th>Contact Address</Table.Th>
          <Table.Th>Type</Table.Th>
          <Table.Th>Subject</Table.Th>
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
    const setTagsDropDownOpen = useGlobalModals(
      (state) => state.setTagsDropDownOpen
    );

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
        // Set the width and height
        const width = "300px"; // You can modify this to any value or make it dynamic
        const height = "200px"; // Modify this as well

        // Create the image tag with width and height
        const imageTag = `<img src="${videoToBeShared.thumbnailURL}" width="${width}" height="${height}" />`;

        const range = quill.getSelection();
        if (range === null) {
          // Insert the image at the current cursor position
          quill.clipboard.dangerouslyPasteHTML(0, imageTag);
          // Move the cursor to the end of the inserted image
          quill.setSelection(0 + imageTag.length);
        }

        // Insert the image at the current cursor position
        quill.clipboard.dangerouslyPasteHTML(range.index, imageTag);
        // Move the cursor to the end of the inserted image
        quill.setSelection(range.index + imageTag.length);
      };

      // Style and append custom buttons to the wrapper
      [pasteLinkButton, pasteThumbnailButton].forEach((btn) => {
        btn.classList.add("ql-formats");
        customButtonsWrapper.appendChild(btn);
      });

      const tagsButtonWrapper = document.createElement("div");
      tagsButtonWrapper.id = "tag-button-wrapper";

      const tagButton = document.createElement("button");
      tagButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="20" aria-hidden="true">
            <path d="M0 80L0 229.5c0 17 6.7 33.3 18.7 45.3l176 176c25 25 65.5 25 90.5 0L418.7 317.3c25-25 25-65.5 0-90.5l-176-176c-12-12-28.3-18.7-45.3-18.7L48 32C21.5 32 0 53.5 0 80zm112 32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" fill="currentColor"/>
          </svg>
        `;
      tagButton.onclick = () => {
        setTagsDropDownOpen(!tagsDropDownOpen);
      };
      tagButton.setAttribute("type", "button");
      tagButton.classList.add("ql-formats");
      tagsButtonWrapper.appendChild(tagButton);

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
        <SelectContactShortCodeDropDown quillRef={ref} />
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
      id: 0,
      name: "Full Name",
      value: "{{name}}",
    },
    {
      id: 1,
      name: "First Name",
      value: "{{first_name}}",
    },
    {
      id: 2,
      name: "Last Name",
      value: "{{last_name}}",
    },
    {
      id: 3,
      name: "Email",
      value: "{{email}}",
    },
    {
      id: 4,
      name: "Phone",
      value: "{{phone}}",
    },
    {
      id: 5,
      name: "Company Name",
      value: "{{company_name}}",
    },
    {
      id: 6,
      name: "Full Address",
      value: "{{full_address}}",
    },
    {
      id: 7,
      name: "City",
      value: "{{city}}",
    },
    {
      id: 8,
      name: "State",
      value: "{{state}}",
    },
    {
      id: 9,
      name: "Country",
      value: "{{country}}",
    },
    {
      id: 10,
      name: "Postal Code",
      value: "{{postal_code}}",
    },
    {
      id: 11,
      name: "Date of Birth",
      value: "{{date_of_birth}}",
    },
    {
      id: 12,
      name: "Source",
      value: "{{source}}",
    },
    {
      id: 13,
      name: "ID",
      value: "{{id}}",
    },
  ];

  // shortCodes Tags Data
  const tagsDropDownOpen = useGlobalModals((state) => state.tagsDropDownOpen);
  const setTagsDropDownOpen = useGlobalModals(
    (state) => state.setTagsDropDownOpen
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

    console.log("shortCodesSelected", shortCodesSelected);

    const updatedShortCodes = [...shortCodesSelected, selectedShortCodeValue];
    // remove duplicates
    const uniqueShortCodes = [...new Set(updatedShortCodes)];

    setShortCodesSelected(uniqueShortCodes);

    if (quillContent.ops.length === 1 && quillContent.ops[0].insert === "\n") {
      quill.insertText(0, shortCodeValue, {
        bold: true,
      });

      quill.setSelection(textLength - 1 + shortCodeValue.length);
    } else {
      // Insert the Short Code with formatting
      quill.insertText(textLength - 1, shortCodeValue, {
        bold: true,
      });

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
        className="h-full w-full overflow-auto pr-[6px]"
        id="shortCodeDropDown-content"
      >
        {shortCodesData.map((tag) => (
          <div
            key={tag.id}
            className="p-[8px] hover:bg-[#F7F7F8] cursor-pointer rounded-[4px]"
            onClick={handleSelectContactShortCode}
          >
            {tag.name}
          </div>
        ))}
      </div>
    </div>
  );
};

TextEditor.displayName = "Editor";
