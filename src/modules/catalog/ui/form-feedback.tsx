export function FormFeedback({
  message,
  success,
}: Readonly<{ message?: string; success?: boolean }>) {
  if (!message) return null;

  if (success) return <output className="form-success">{message}</output>;

  return (
    <p className="form-message" role="alert">
      {message}
    </p>
  );
}
