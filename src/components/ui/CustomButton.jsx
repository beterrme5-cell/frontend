const CustomButton = ({ id, className, onClick, label, varient }) => {
  return (
    <button
      id={id ? id : ""} // Add id attribute
      className={`p-[8px_16px] text-[14px] font-medium rounded-[8px] ${
        className ? className : ""
      } ${
        varient === "filled"
          ? "bg-primary text-white border-none"
          : "bg-white border border-gray-dark text-darkBlue"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
};

export default CustomButton;
