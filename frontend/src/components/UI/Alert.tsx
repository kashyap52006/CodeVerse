// Alert will be completed in Prompt 7
interface AlertProps {
  message: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

export function Alert({ message }: AlertProps) {
  return (
    <div role="alert" className="rounded border px-4 py-3 text-sm">
      {message}
    </div>
  );
}
