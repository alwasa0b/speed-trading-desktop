import React from "react";

export default ({ value, fix = 3 }) => {
  return (
    <div>
      {value == null || value == "Infinity" || isNaN(value)
        ? ""
        : Number.parseFloat(value).toFixed(fix)}
    </div>
  );
};
