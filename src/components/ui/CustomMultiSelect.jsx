import Select, { components } from "react-select";

const CustomMultiValue = (props) => {
  const MAX_DISPLAY = 3;
  const { index, data, selectProps } = props;
  const currentTab = selectProps.selectProps.currentTab;
  // Extract selected values from selectProps.value
  const selectedValues = selectProps.value || [];

  // Render first 3 selected items normally
  if (index < MAX_DISPLAY) {
    return (
      <components.MultiValue {...props}>
        <components.MultiValueLabel {...props}>
          {currentTab === "email" ? data.email : data.phone}
        </components.MultiValueLabel>
      </components.MultiValue>
    );
  }

  // Show "+X more" for the 4th item and onwards
  if (index === MAX_DISPLAY) {
    const remainingCount = selectedValues.length - MAX_DISPLAY;
    return (
      <div style={{ padding: "0 8px", fontSize: "14px", fontWeight: "bold" }}>
        +{remainingCount} more
      </div>
    );
  }

  // Hide additional values beyond the 3rd one
  return null;
};

const CustomMultiSelect = ({
  contactsData,
  totalContacts,
  currentPage,
  setCurrentPage,
  value,
  onChange,
  isDisabled,
  isLoading,
  onInputChange,
  currentTab,
}) => {
  return (
    <Select
      isMulti
      value={value}
      options={contactsData}
      components={{ MultiValue: CustomMultiValue }}
      placeholder="Select contacts..."
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      onMenuScrollToBottom={() => {
        const expectedPages = Math.ceil(totalContacts / 100);
        if (currentPage < expectedPages) {
          setCurrentPage((prev) => prev + 1);
        }
      }}
      noOptionsMessage={() => "No contacts found!"}
      className="w-[80%] ms-[2px]"
      isSearchable
      onInputChange={(value) => onInputChange(value)}
      isLoading={isLoading}
      isDisabled={isDisabled}
      selectProps={{ currentTab }}
      onChange={(value) => {
        console.log("udpated value", value);
        onChange(value);
      }}
    />
  );
};

export default CustomMultiSelect;
