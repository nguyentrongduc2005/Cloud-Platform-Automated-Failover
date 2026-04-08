import React from "react";

export default function Breadcrumb({ path = [] }) {
  return (
    <div className="breadcrumb">
      {path.map((p, i) => (
        <span key={i}>
          {p}
          {i < path.length - 1 && <span className="sep"> / </span>}
        </span>
      ))}
    </div>
  );
}
