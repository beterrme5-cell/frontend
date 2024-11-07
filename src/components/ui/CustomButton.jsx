const CustomButton = ({ className, onClick, label }) => {
  return (
    <button
      className={`p-[8px_16px] text-[14px] font-medium ${
        className ? className : ""
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default CustomButton;
