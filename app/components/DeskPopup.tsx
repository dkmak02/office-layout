import React from "react";
import { DeskPopupProps } from "../models/deskModel";
const DeskPopup = (
  { deskData, position, isConferenceRoom }:DeskPopupProps
) => {
  const { x, y } = position;
  const { deskName, personAssigned, projectAssigned } = deskData;

  const popupWidth = 250;
  const popupHeight = 100;
  const screenPadding = 10;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let adjustedX = x;
  let adjustedY = y - 25;

  if (x + popupWidth / 2 > windowWidth - screenPadding) {
    adjustedX = windowWidth - popupWidth / 2 - screenPadding;
  }

  if (x - popupWidth / 2 < screenPadding) {
    adjustedX = popupWidth / 2 + screenPadding;
  }

  if (y + popupHeight > windowHeight - screenPadding) {
    adjustedY = windowHeight - popupHeight - screenPadding;
  }
  if (adjustedY < 0) {
    adjustedY = 125;
  }

  return (
    <div
      className="fixed top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-lg p-3 max-w-xs shadow-lg text-left z-50 pointer-events-none break-words"
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
    >
      <h2 className="m-0 mb-2 text-lg font-semibold text-gray-800">
        {deskName}
      </h2>

      {!isConferenceRoom && (
        <p className="m-1 text-sm text-gray-600">
          <strong>Przypisana osoba:</strong> {personAssigned || "Brak"}
        </p>
      )}
      {!isConferenceRoom && (
        <p className="m-1 text-sm text-gray-600">
          <strong>Przypisany projekt:</strong> {projectAssigned || "Brak"}
        </p>
      )}
    </div>
  );

};

export default DeskPopup;
