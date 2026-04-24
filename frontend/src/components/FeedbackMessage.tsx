type FeedbackMessageProps = {
  tone: "success" | "error" | "info";
  message: string;
};

export function FeedbackMessage({ tone, message }: FeedbackMessageProps) {
  return <div className={`feedback ${tone}`}>{message}</div>;
}
