const CustomVideoInput = ({ form }) => {
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("video/")) {
      form.setFieldValue("uploadedVideo", file);
      console.log("Selected video file:", file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      form.setFieldValue("uploadedVideo", file);
      console.log("Dropped video file:", file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };
  return (
    <div className="flex flex-col gap-[8px]">
      <p className="text-[14px] font-medium text-[#212121]">Upload Video</p>
      <div
        className="w-full h-[238px] rounded-[12px] bg-[#F7F7F8] border border-[#D7D5DD] border-dashed flex justify-center items-center"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <p className="text-[14px]">
          Drag and drop your video file here or&nbsp;
          <label
            htmlFor="videoInput"
            className="text-primary underline hover:cursor-pointer"
          >
            click
          </label>
          &nbsp;to browse.
        </p>
        <input
          type="file"
          id="videoInput"
          className="hidden"
          accept="video/*"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
};

export default CustomVideoInput;
