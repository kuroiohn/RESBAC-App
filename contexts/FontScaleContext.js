import React, { createContext, useState } from "react";

export const FontScaleContext = createContext();

export const FontScaleProvider = ({ children }) => {
  const [fontScale, setFontScale] = useState(1);

  const increaseFont = () => setFontScale((prev) => prev + 0.1);
  const decreaseFont = () => setFontScale((prev) => Math.max(0.5, prev - 0.1));
  const setCustomFontScale = (scale) => setFontScale(scale);

  return (
    <FontScaleContext.Provider
      value={{ fontScale, increaseFont, decreaseFont, setCustomFontScale }}
    >
      {children}
    </FontScaleContext.Provider>
  );
};
