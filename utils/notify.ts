import { toast } from "sonner";

function showNotification(
  message: string,
  type: "success" | "error" | "info" = "info"
) {
  if (type === "success") {
    toast.success(message);
  } else if (type === "error") {
    toast.error(message);
  } else {
    toast.info(message);
  }
}

export default showNotification;
