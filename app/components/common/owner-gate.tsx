import type { ReactNode } from "react";

interface OwnerGateProps {
  isOwner: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export function OwnerGate({
  isOwner,
  children,
  fallback = null,
}: OwnerGateProps) {
  return <>{isOwner ? children : fallback}</>;
}
