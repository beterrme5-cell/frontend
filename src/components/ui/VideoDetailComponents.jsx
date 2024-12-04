import { Link } from "react-router-dom";
import {
  DELETE_ICON,
  EDIT_ICON,
  GO_BACK,
  SHARE_ICON,
} from "../../assets/icons/DynamicIcons.jsx";

// import goBackIcon from "../../assets/icons/goBack.svg";

export const VideoDetailRoot = ({ children }) => {
  const recodingsPagePath = window.location.pathname.split("/")[1];

  const accessToken = localStorage.getItem("accessToken");

  return (
    <section className="bg-white p-[32px] rounded-[12px] flex flex-col gap-[12px]">
      <Link
        to={
          recodingsPagePath === "recordings"
            ? `/recordings/${accessToken}`
            : "/"
        }
        className="flex items-center gap-[8px] text-[16px] font-medium text-primary"
      >
        <GO_BACK />
        Go back to Library
      </Link>
      <div className="flex flex-col gap-[24px]">{children}</div>
    </section>
  );
};

export const VideoDetailHeader = ({ title, description }) => {
  return (
    <div className="flex flex-col gap-[4px]">
      <h1 className="text-[24px] font-medium text-darkBlue">{title}</h1>
      <p className="text-[16px] text-gray-dark">{description}</p>
    </div>
  );
};

export const VideoDetailPreview = ({ videoUrl }) => {
  return (
    <iframe
      width="100%"
      height="450px"
      src={videoUrl}
      allow="camera; microphone"
      className="max-w-[711px] rounded-[12px]"
      allowFullScreen
    ></iframe>
  );
};

export const VideoDetailActions = ({ children }) => {
  return <div className="flex items-center gap-[12px]">{children}</div>;
};

export const VideoDetailActionBtn = ({ label, actionType, onClick }) => {
  return (
    <button
      className={`flex items-center gap-[8px] text-[14px] font-medium ${
        actionType === "share"
          ? "bg-primary text-white"
          : actionType === "edit"
          ? "text-primary border border-primary"
          : actionType === "delete"
          ? "border border-[#FF0000] text-[#FF0000]"
          : null
      } px-[28px] py-[10px] rounded-[8px]`}
      onClick={onClick}
    >
      {actionType === "share" ? (
        <SHARE_ICON className="w-[20px] h-[20px]" />
      ) : actionType === "edit" ? (
        <EDIT_ICON className="w-[20px] h-[20px]" />
      ) : actionType === "delete" ? (
        <DELETE_ICON className="w-[20px] h-[20px]" />
      ) : null}
      {label}
    </button>
  );
};
