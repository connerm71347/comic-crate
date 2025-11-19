import { useRouter } from "next/navigation";
import Link from "next/link";

const ErrorMessage = ({ message }: { message: string }) => {
  const error = useRouter();
  return (
    <div className="error-message">
      <h2>Error</h2>
      <p>{message}</p>
      <Link href="/">Return to the home page</Link>
    </div>
  );
};

export default ErrorMessage;
