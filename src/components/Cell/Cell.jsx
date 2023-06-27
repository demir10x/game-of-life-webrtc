import React from "react";
import "./index.css";

const Cell = ({ isActive = false, onClick }) => {
	return <div onClick={onClick} className={`cell-container ${isActive ? "active" : ""}`} />;
};

export default Cell;
