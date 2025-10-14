import React from "react";
import ThemeController from "../General/ThemeController";

const Header = ({
  interviewName,
  isRecording,
  onRecordToggle,
  isConnected,
  onDisconnect,
  onConnect,
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-black border-b border-gray-700">
      <h1 className="text-xl font-medium text-white">{interviewName}</h1>
      <div className="flex gap-3">
        <ThemeController />
        <button
          onClick={onRecordToggle}
          disabled={!isConnected}
          className={`btn btn-error ${isRecording ? "btn-active" : ""} rounded-lg px-8`}
        >
          {isRecording ? "Recording..." : "Record"}
        </button>
        <button
          onClick={isConnected ? onDisconnect : onConnect}
          className="btn btn-error rounded-lg px-8"
        >
          {isConnected ? "Disconnect" : "Connect"}
        </button>
      </div>
    </div>
  );
};

export default Header;
