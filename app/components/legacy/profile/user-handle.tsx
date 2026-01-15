import { SealCheckIcon } from "@phosphor-icons/react";

export default function UserHandle({ handle }: { handle: string }) {
  return (
    <aside className="font-semibold flex items-center gap-1 min-w-0">
      <SealCheckIcon className="fill-blue-500 size-5" weight="fill" />
      <p className="text-sm truncate lg:w-full lg:text-base">{handle}</p>
    </aside>
  );
}
