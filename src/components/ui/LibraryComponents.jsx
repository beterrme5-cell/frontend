import CustomButton from "./CustomButton";
import { Tabs } from "@mantine/core";

import ShareVideoIcon from "../../assets/icons/shareVideoIcon.svg";
import VideoOptionsIcon from "../../assets/icons/VideoOptionsIcon.svg";
import ArrowDownIcon from "../../assets/icons/arrow-down.svg";
import CopyIcon from "../../assets/icons/copy-icon.svg";
import ShareIcon from "../../assets/icons/share-icon.svg";
import EditIcon from "../../assets/icons/edit-icon.svg";
import DeleteIcon from "../../assets/icons/delete-icon.svg";
import { Table } from "@mantine/core";
import { Menu } from "@mantine/core";
import { useGlobalModals } from "../../store/globalModals";

export const LibraryRoot = ({ children }) => {
  return (
    <section className="bg-white p-[32px] rounded-[12px]">{children}</section>
  );
};

export const LibraryHeader = ({
  title,
  onUploadVideoBtnClick,
  onNewVideoBtnClick,
}) => {
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-[28px] font-bold ">{title}</h1>
      <div className="flex items-center gap-[12px]">
        <CustomButton
          onClick={onUploadVideoBtnClick}
          varient="outlined"
          label="Upload Video"
        />
        <CustomButton
          onClick={onNewVideoBtnClick}
          varient="filled"
          label="New Video"
        />
      </div>
    </header>
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
    <div className="grid grid-cols-6 gap-[24px] mt-[16px]">{children}</div>
  );
};

export const VideoTabItem = ({ videoData }) => {
  const setIsDeleteVideoModalOpen = useGlobalModals(
    (state) => state.setIsDeleteVideoModalOpen
  );
  const setIsEditVideoModalOpen = useGlobalModals(
    (state) => state.setIsEditVideoModalOpen
  );
  const setVideoToBeDeleted = useGlobalModals(
    (state) => state.setVideoToBeDeleted
  );
  const setVideoToBeEdited = useGlobalModals(
    (state) => state.setVideoToBeEdited
  );

  return (
    <div className="flex flex-col border border-[#CFCED4] rounded-[16px] relative min-w-[250px] h-[210px] overflow-hidden hover:cursor-pointer">
      <div className={`h-[160px] relative`}>
        {/* <iframe
          width="100%"
          height="100%"
          src={videoData.videoLink}
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe> */}
        <img
          src="https://s3-alpha-sig.figma.com/img/8238/d197/077f40948736f63966988f296dc35cdc?Expires=1731888000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=SIW80GJs~r3Ieu~r0i1Ki5DSyrHjLMUafaUBQVmPJM5i8Idxtq~OVbCpiUtiRjY92LK5xCQg~PJq7r7GZW3QOO0BgQJKUGvs7SE0yPX8l5mVuXdTa0iyNSJ1C~hkHpF4OSFvFdy11oObQ9Y~l5SvMw4Z2FE5IZ7QqARtVWCC~x9zit5NbGdg0muVDYuBsXv~Xgmd1BWXxzIkYFXrCCFS~lqePGiAMIiuJwFXD7NjB8bsnt4MMhfeIVY4zg2jjWUJABr-48PIoMjvOfOv~hVS-j4ud4LpgmPfkMEGDMacGA7QIGXceF7saDJTuls8ZBag4y31VDFNj7Nf9pwBWE8Bsw__"
          alt="Video Thumbnail"
          className="w-full h-full object-cover"
        />
        <img
          src={ShareVideoIcon}
          alt="Share Video Icon"
          className={`absolute top-[8px] right-[8px] cursor-pointer`}
          onClick={() => alert("Share Video")}
        />
      </div>
      <div className="flex-grow px-[16px] py-[12px] flex items-center justify-between gap-[10px] border-t border-t-[#CFCED4]">
        <p className="text-[14px] font-medium">{videoData.title}</p>
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
            >
              Share
            </Menu.Item>
            <Menu.Item
              leftSection={
                <img src={EditIcon} alt="Copy Icon" className="w-[20px]" />
              }
              onClick={() => {
                console.log("Edit Video", videoData);
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
    <Table.Tr key={element.id}>
      <Table.Td className=" text-[14px] font-medium">{element.id}</Table.Td>
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
