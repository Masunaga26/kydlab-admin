import * as React from "react";

export function Label({ children, ...props }) {
  return (
    <label style={{ display: "block", marginBottom: 4 }} {...props}>
      {children}
    </label>
  );
}