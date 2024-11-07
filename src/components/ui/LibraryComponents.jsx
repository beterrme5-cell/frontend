// import PropTypes from "prop-types";
// LibraryRoot.propTypes = {
//   children: PropTypes.node.isRequired,
// };

import CustomButton from "./CustomButton";

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
      <h1>{title}</h1>
      <CustomButton onClick={onUploadVideoBtnClick} />
      <CustomButton onClick={onNewVideoBtnClick} />
    </header>
  );
};
