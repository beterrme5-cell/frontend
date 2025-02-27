import Select, { components } from "react-select";

const CustomMultiValue = (props) => {
  const MAX_DISPLAY = 3;
  const { index, data, selectProps } = props;

  // Extract selected values from selectProps.value
  const selectedValues = selectProps.value || [];

  // Render first 3 selected items normally
  if (index < MAX_DISPLAY) {
    return (
      <components.MultiValue {...props}>
        <components.MultiValueLabel {...props}>
          {data.label}
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

const CustomTagsSelect = ({ tagsData, value, onChange }) => {
  // console.log("tagsData", tagsData);
  return (
    <Select
      isMulti
      value={value}
      options={tagsData}
      components={{ MultiValue: CustomMultiValue }}
      placeholder="Select tags..."
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      noOptionsMessage={() => "No tags found!"}
      className="lg:w-1/2 w-full ms-[2px]"
      isSearchable
      onChange={(newValue) => {
        // const updatedValuesArray = newValue.map((option) => option.value);
        onChange(newValue);
      }}
    />
  );
};

export default CustomTagsSelect;
