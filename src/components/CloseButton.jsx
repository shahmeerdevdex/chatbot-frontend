import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSnackbar } from "notistack";

// eslint-disable-next-line react/prop-types
export default function CloseButton({ snackbarKey }) {
  const { closeSnackbar } = useSnackbar();
  return (
    <button
      onClick={() => closeSnackbar(snackbarKey)}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: "inherit",
        padding: 0,
        margin: 0,
      }}
    >
      <FontAwesomeIcon icon={faCircleXmark} />
    </button>
  );
}
