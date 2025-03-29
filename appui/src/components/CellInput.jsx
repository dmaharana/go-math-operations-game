import React from "react";

const CellInput = ({
  cellId,
  value,
  onChange,
  onFocus,
  disabled,
  className,
  placeholder,
  inputRef,
}) => {
  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      disabled={disabled}
      className={className}
      placeholder={placeholder}
    />
  );
};

export default CellInput;
