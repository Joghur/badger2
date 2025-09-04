import { MenubarShortcut } from "@/components/ui/menubar";

const Shortcut = ({ keys }: { keys: string }) => (
  <MenubarShortcut className="text-base">{keys}</MenubarShortcut>
);

export default Shortcut;
