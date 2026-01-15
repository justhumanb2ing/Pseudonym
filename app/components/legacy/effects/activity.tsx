import { AnimatePresence, motion, usePresenceData } from "motion/react";
import type { ClassValue } from "clsx";
import type React from "react";
import { cn } from "@/lib/utils";

type Direction = 1 | -1;

type ActivityProps = {
  /**
   * A stable key that changes when the "screen"/step changes.
   * This ensures only one child is present in the layout flow at a time.
   */
  activeKey: string;
  direction: Direction;
  children: React.ReactNode;
  className?: ClassValue;
};

export function Activity({
  activeKey,
  direction,
  children,
  className,
}: ActivityProps) {
  return (
    <AnimatePresence custom={direction} mode="wait" initial={false}>
      <ActivityContent key={activeKey} className={className}>
        {children}
      </ActivityContent>
    </AnimatePresence>
  );
}

function ActivityContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: ClassValue;
}) {
  const direction = (usePresenceData() ?? 1) as Direction;

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, x: direction * 50 }}
      animate={{
        opacity: 1,
        x: 0,
        transition: {
          delay: 0.2,
          type: "spring",
          visualDuration: 0.3,
          bounce: 0.4,
        },
      }}
      exit={{
        opacity: 0,
        x: direction * -50,
        transition: { duration: 0.2, visualDuration: 0.3, bounce: 0.4 },
      }}
    >
      {children}
    </motion.div>
  );
}
