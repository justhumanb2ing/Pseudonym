// 

// import * as React from "react"
// import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

// import { cn } from '@/lib/utils'

// function Popover({ ...props }: PopoverPrimitive.Root.Props) {
//   return <PopoverPrimitive.Root data-slot="popover" {...props} />
// }

// function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
//   return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
// }

// function PopoverContent({
//   className,
//   align = "center",
//   alignOffset = 0,
//   side = "bottom",
//   sideOffset = 4,
//   ...props
// }: PopoverPrimitive.Popup.Props &
//   Pick<
//     PopoverPrimitive.Positioner.Props,
//     "align" | "alignOffset" | "side" | "sideOffset"
//   >) {
//   return (
//     <PopoverPrimitive.Portal>
//       <PopoverPrimitive.Positioner
//         align={align}
//         alignOffset={alignOffset}
//         side={side}
//         sideOffset={sideOffset}
//         className="isolate z-50"
//       >
//         <PopoverPrimitive.Popup
//           data-slot="popover-content"
//           className={cn(
//             "bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 flex flex-col gap-4 rounded-lg p-2.5 text-xs shadow-md ring-1 duration-100 z-50 w-72 origin-(--transform-origin) outline-hidden",
//             className
//           )}
//           {...props}
//         />
//       </PopoverPrimitive.Positioner>
//     </PopoverPrimitive.Portal>
//   )
// }

// function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
//   return (
//     <div
//       data-slot="popover-header"
//       className={cn("flex flex-col gap-1 text-xs", className)}
//       {...props}
//     />
//   )
// }

// function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
//   return (
//     <PopoverPrimitive.Title
//       data-slot="popover-title"
//       className={cn("text-sm font-medium", className)}
//       {...props}
//     />
//   )
// }

// function PopoverDescription({
//   className,
//   ...props
// }: PopoverPrimitive.Description.Props) {
//   return (
//     <PopoverPrimitive.Description
//       data-slot="popover-description"
//       className={cn("text-muted-foreground", className)}
//       {...props}
//     />
//   )
// }

// export {
//   Popover,
//   PopoverContent,
//   PopoverDescription,
//   PopoverHeader,
//   PopoverTitle,
//   PopoverTrigger,
// }

import * as React from "react";

import {
  Popover as PopoverPrimitive,
  PopoverTrigger as PopoverTriggerPrimitive,
  PopoverPositioner as PopoverPositionerPrimitive,
  PopoverPopup as PopoverPopupPrimitive,
  PopoverPortal as PopoverPortalPrimitive,
  PopoverClose as PopoverClosePrimitive,
  PopoverBackdrop as PopoverBackdropPrimitive,
  PopoverTitle as PopoverTitlePrimitive,
  PopoverDescription as PopoverDescriptionPrimitive,
  type PopoverProps as PopoverPrimitiveProps,
  type PopoverTriggerProps as PopoverTriggerPrimitiveProps,
  type PopoverPositionerProps as PopoverPositionerPrimitiveProps,
  type PopoverPopupProps as PopoverPopupPrimitiveProps,
  type PopoverCloseProps as PopoverClosePrimitiveProps,
  type PopoverBackdropProps as PopoverBackdropPrimitiveProps,
  type PopoverTitleProps as PopoverTitlePrimitiveProps,
  type PopoverDescriptionProps as PopoverDescriptionPrimitiveProps,
} from "./base-popover";
import { cn } from "@/lib/utils";

type PopoverProps = PopoverPrimitiveProps;

function Popover(props: PopoverProps) {
  return <PopoverPrimitive {...props} />;
}

type PopoverTriggerProps = PopoverTriggerPrimitiveProps;

function PopoverTrigger(props: PopoverTriggerProps) {
  return <PopoverTriggerPrimitive {...props} />;
}

type PopoverPanelProps = PopoverPositionerPrimitiveProps &
  PopoverPopupPrimitiveProps;

function PopoverPanel({
  className,
  align = "center",
  sideOffset = 4,
  initialFocus,
  finalFocus,
  style,
  children,
  ...props
}: PopoverPanelProps) {
  return (
    <PopoverPortalPrimitive>
      <PopoverPositionerPrimitive
        align={align}
        sideOffset={sideOffset}
        className="z-50"
        {...props}
      >
        <PopoverPopupPrimitive
          initialFocus={initialFocus}
          finalFocus={finalFocus}
          className={cn(
            "bg-popover text-popover-foreground w-72 rounded-md border p-4 shadow-md outline-hidden origin-(--transform-origin)",
            className
          )}
          style={style}
        >
          {children}
        </PopoverPopupPrimitive>
      </PopoverPositionerPrimitive>
    </PopoverPortalPrimitive>
  );
}

type PopoverCloseProps = PopoverClosePrimitiveProps;

function PopoverClose(props: PopoverCloseProps) {
  return <PopoverClosePrimitive {...props} />;
}

type PopoverBackdropProps = PopoverBackdropPrimitiveProps;

function PopoverBackdrop(props: PopoverBackdropProps) {
  return <PopoverBackdropPrimitive {...props} />;
}

type PopoverTitleProps = PopoverTitlePrimitiveProps;

function PopoverTitle(props: PopoverTitleProps) {
  return <PopoverTitlePrimitive {...props} />;
}

type PopoverDescriptionProps = PopoverDescriptionPrimitiveProps;

function PopoverDescription(props: PopoverDescriptionProps) {
  return <PopoverDescriptionPrimitive {...props} />;
}

export {
  Popover,
  PopoverTrigger,
  PopoverPanel,
  PopoverClose,
  PopoverBackdrop,
  PopoverTitle,
  PopoverDescription,
  type PopoverProps,
  type PopoverTriggerProps,
  type PopoverPanelProps,
  type PopoverCloseProps,
  type PopoverBackdropProps,
  type PopoverTitleProps,
  type PopoverDescriptionProps,
};
