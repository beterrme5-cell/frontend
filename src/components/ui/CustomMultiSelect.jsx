import React, { useState, useEffect } from "react";
import Select, { components } from "react-select";

const CustomMultiValue = (props) => {
  const MAX_DISPLAY = 3;
  const { index, data, selectProps } = props;
  const currentTab = selectProps.selectProps.currentTab;
  const selectedValues = selectProps.value || [];

  if (index < MAX_DISPLAY) {
    return (
      <components.MultiValue {...props}>
        <components.MultiValueLabel {...props}>
          {currentTab === "email" ? data.email : data.phone}
        </components.MultiValueLabel>
      </components.MultiValue>
    );
  }

  if (index === MAX_DISPLAY) {
    const remainingCount = selectedValues.length - MAX_DISPLAY;
    return (
      <div style={{ padding: "0 8px", fontSize: "14px", fontWeight: "bold" }}>
        +{remainingCount} more
      </div>
    );
  }

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
  const [inputValue, setInputValue] = useState("");
  const [isPhoneInput, setIsPhoneInput] = useState(false);

  useEffect(() => {
    setInputValue("");
    setIsPhoneInput(false);
  }, [currentTab]);

  const handleInputChange = (value, { action }) => {
    let processedValue = value;

    if (currentTab === "sms") {
      // Check if input contains numbers (excluding potential +1 prefix)
      const hasNumbers = /[0-9]/.test(value.replace(/^\+1/, ""));

      if (hasNumbers) {
        setIsPhoneInput(true);
        // Handle phone number input
        if (value === "+") {
          processedValue = "+1";
        } else if (!value.startsWith("+1")) {
          if (value.length > 0 && !value.startsWith("+")) {
            processedValue = "+1" + value;
          } else if (value.length < 2) {
            processedValue = "+1";
          } else if (value.startsWith("+") && value[1] !== "1") {
            processedValue = "+1" + value.slice(2);
          }
        }
      } else {
        // Text input - don't add +1
        setIsPhoneInput(false);
        // If they type + manually but then letters, remove it
        if (value.startsWith("+") && !/[0-9]/.test(value.slice(1))) {
          processedValue = value.slice(1);
        }
      }
    }

    setInputValue(processedValue);
    onInputChange(processedValue);
  };

  const customStyles = {
    input: (provided) => ({
      ...provided,
      color: isPhoneInput ? "#999" : "#333",
      "& input": {
        paddingLeft: isPhoneInput ? "20px" : "8px",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      paddingLeft: "8px",
    }),
  };

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
      inputValue={inputValue}
      onInputChange={handleInputChange}
      isLoading={isLoading}
      isDisabled={isDisabled}
      selectProps={{ currentTab }}
      onChange={onChange}
      styles={customStyles}
      onFocus={() => {
        if (currentTab === "sms") {
          setInputValue("");
        }
      }}
    />
  );
};

export default CustomMultiSelect;
