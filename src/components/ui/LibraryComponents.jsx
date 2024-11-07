import CustomButton from "./CustomButton";
import { Tabs } from "@mantine/core";

import ShareVideoIcon from "../../assets/icons/shareVideoIcon.svg";
import VideoOptionsIcon from "../../assets/icons/VideoOptionsIcon.svg";

import CopyIcon from "../../assets/icons/copy-icon.svg";
import ShareIcon from "../../assets/icons/share-icon.svg";
import EditIcon from "../../assets/icons/edit-icon.svg";
import DeleteIcon from "../../assets/icons/delete-icon.svg";

import { Menu } from "@mantine/core";

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

export const VideoTabItem = ({
  title,
  description,
  videoLink,
  videoLength,
}) => {
  console.log("Descrption", description);

  return (
    <div className="flex flex-col border border-[#CFCED4] rounded-[16px] relative min-w-[250px] h-[210px] overflow-hidden hover:cursor-pointer">
      <div className={`h-[160px] relative`}>
        <iframe
          width="100%"
          height="100%"
          src={videoLink}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
        <img
          src={ShareVideoIcon}
          alt="Share Video Icon"
          className={`absolute top-[8px] right-[8px] cursor-pointer`}
          onClick={() => alert("Share Video")}
        />
      </div>
      <div className="flex-grow px-[16px] py-[12px] flex items-center justify-between gap-[10px] border-t border-t-[#CFCED4]">
        <p className="text-[14px] font-medium">{title}</p>
        <Menu
          shadow="md"
          width={150}
          position="bottom-end"
          arrowPosition="center"
          radius={12}
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
            <img src={VideoOptionsIcon} alt="Video Options Icon" />
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
            >
              Edit
            </Menu.Item>
            <Menu.Item
              color="red"
              leftSection={
                <img src={DeleteIcon} alt="Copy Icon" className="w-[20px]" />
              }
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
};
