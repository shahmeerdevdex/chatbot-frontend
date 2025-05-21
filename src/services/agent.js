import axios from "axios";

// Only keeping the fetchAgentDetails function needed for TrainBot
export const fetchAgentDetails = async (token, agentId) => {
  const response = await axios.get(
    `${import.meta.env.VITE_APP_API_URL}/agent/details/${agentId}`,
    {
      headers: { token },
    }
  );
  return response.data;
};
