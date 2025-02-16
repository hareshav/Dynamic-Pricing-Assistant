import React, { createContext, useState } from "react";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [queryResult, setQueryResult] = useState(null);

  return (
    <DataContext.Provider value={{ queryResult, setQueryResult }}>
      {children}
    </DataContext.Provider>
  );
};
