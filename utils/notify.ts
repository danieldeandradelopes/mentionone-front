function showNotification(
  message: string,
  type: "success" | "error" | "info" = "info"
) {
  // Implementação básica usando console.log
  // Você pode substituir por uma biblioteca de notificações como react-toastify, sonner, etc.
  console.log(`[${type.toUpperCase()}] ${message}`);

  // Exemplo de implementação com alert (pode ser substituído por uma lib de toast)
  if (typeof window !== "undefined") {
    // Aqui você pode integrar com sua biblioteca de notificações preferida
    // Por exemplo: toast.success(message) ou toast.error(message)
  }
}

export default showNotification;
