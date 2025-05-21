import { Box, CircularProgress } from "@mui/material";
import Backdrop from "@mui/material/Backdrop";

// Only keeping the PageLoading component that's used in TrainBot
export const PageLoading = ({ loading, text }) => {
  return (
    <div>
      <Backdrop
        sx={{
          zIndex: 1000,
          backgroundColor: "rgba(255, 255, 255, 0.3)",
          position: "absolute",
        }}
        open={loading}
      >
        <Box
          width="100%"
          height="100%"
          sx={{
            background: "transparent",
            backdropFilter: "blur(10px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: {
              md: "row",
              xs: "column",
            },
            gap: "20px",
            position: "fixed",
            top: 0,
          }}
        >
          <div>
            <CircularProgress
              sx={{
                color: "#EF6E4D",
              }}
              size={80}
            />
          </div>
          {text && (
            <h2
              style={{
                color: "#EF6E4D",
                textAlign: "center",
              }}
            >
              {text}
            </h2>
          )}
        </Box>
      </Backdrop>
    </div>
  );
};
