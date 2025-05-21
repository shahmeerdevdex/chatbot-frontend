import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { QueryClient, QueryClientProvider } from "react-query";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import AppContext from "./context/AppContext";
import TrainBot from "./components/TrainBot";
import CloseButton from "./components/CloseButton";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const queryClient = new QueryClient();

function App() {
  const theme = createTheme({
    typography: {
      fontFamily: "Plus Jakarta Sans, sans-serif",
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <AppContext>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          action={(key) => <CloseButton snackbarKey={key} />}
        >
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<TrainBot />} />
                <Route path="/train/:id" element={<TrainBot />} />
              </Routes>
            </BrowserRouter>
          </QueryClientProvider>
        </SnackbarProvider>
      </AppContext>
    </ThemeProvider>
  );
}

export default App;
