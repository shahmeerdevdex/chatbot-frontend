import React from "react";
import ReactDOM from "react-dom/client";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import App from "./App.jsx";
import "./index.css";
import AppContext from "./context/AppContext.jsx";

const stripePromise = loadStripe(import.meta.env.VITE_APP_STRIPE_TEST_KEY);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Elements stripe={stripePromise}>
      <AppContext>
        <App />
      </AppContext>
    </Elements>
  </React.StrictMode>
);
