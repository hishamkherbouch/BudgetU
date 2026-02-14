import { Button } from "@/components/ui/button";

export default function EmptyState({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="text-center py-12">
      <p className="text-budgetu-muted text-lg mb-4">{message}</p>
      {actionLabel && onAction && (
        <Button
          className="bg-budgetu-accent hover:bg-budgetu-accent-hover text-white"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
