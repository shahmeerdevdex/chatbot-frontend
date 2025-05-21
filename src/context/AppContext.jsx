import { createContext, useContext, useState } from "react";
const AuthContext = createContext();

// eslint-disable-next-line react/prop-types
export default function AppContext({ children }) {
  // Simplified context with only what's needed for TrainBot
  const [userToken, setuserToken] = useState("dummy-token"); // Using a dummy token

  return (
    <AuthContext.Provider
      value={{
        userToken,
        setuserToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStateContext = () => useContext(AuthContext);
