import { showMessage } from "react-native-flash-message";

export const showSuccessMessage = (message) => {
  showMessage({
    message: message,
    type: "success",
    icon: "success",
  });
};

export const showErrorMessage = (message) => {
  showMessage({
    message: message,
    type: "danger",
    icon: "danger",
  });
};
