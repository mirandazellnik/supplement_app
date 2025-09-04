import React, { createContext, useContext, useState, useRef } from "react";
import AlertOverlay from "../components/CustomAlert"; // Adjust path as needed

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const isShowing = useRef(false);

  /**
   * showAlert("title") or showAlert("title", "message")
   */
  const showAlert = (title, message) => {
    return new Promise((resolve) => {
      setQueue((q) => [...q, { title, message, resolve }]);
    });
  };

  const handleNext = () => {
    if (queue.length === 0) return;

    const [current, ...rest] = queue;
    current.resolve(); // resolve the promise
    setQueue(rest);
    isShowing.current = false;
  };

  const currentAlert = queue.length > 0 ? queue[0] : null;

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {currentAlert && (
        <AlertOverlay
          visible={true}
          title={currentAlert.title}
          message={currentAlert.message}
          onClose={handleNext}
        />
      )}
    </AlertContext.Provider>
  );
};
