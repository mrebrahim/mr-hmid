import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-4">
      <div className="rounded-full bg-muted p-4">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-xl font-semibold">Page Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>

      <Link
        href="/dashboard"
        className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
