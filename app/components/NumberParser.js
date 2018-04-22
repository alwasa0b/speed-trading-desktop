import React from "react";

export default ({ value, fix = 2 }) => {
  return (
    <div>
      {value == null || value == "Infinity" || isNaN(value)
        ? ""
        : Number.parseFloat(value).toFixed(fix)}
    </div>
  );
};
