"use client";

import React, { useEffect } from "react";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
} from "@/components/ui/menubar";
import { Button } from "@/components/ui/button";
import Shortcut from "@/components/ShortCut";
import { useKeyPress } from "@/hooks/useKeypress";
import { exit } from "@tauri-apps/plugin-process";

const AppMenu = ({
  onOpenFolder,
  onCreateWorkFolder,
  canCreateWork,
}: {
  onOpenFolder: () => void;
  onCreateWorkFolder: () => void;
  canCreateWork?: boolean;
}) => {
  const handleCtrlO = (event: React.KeyboardEvent | React.MouseEvent) => {
    event.preventDefault();
    console.log("handleCtrlO");
    onOpenFolder();
  };
  const handleAltF4 = async (event: React.KeyboardEvent | React.MouseEvent) => {
    event.preventDefault();
    try {
      await exit(0);
    } catch (err) {
      console.error("Kunne ikke afslutte:", err);
    }
  };

  const handler = useKeyPress<HTMLElement>({
    o: [(event) => handleCtrlO(event), ["Control"]],
    F4: [(event) => handleAltF4(event), ["Alt"]], // Obsolete as system takes over
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => handler(e);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handler]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-6xl">
        <Menubar className="rounded-xl border bg-card/90 shadow-sm text-base">
          <MenubarMenu>
            <MenubarTrigger asChild>
              <Button variant="ghost" size="sm" className="h-12 text-xl">
                Filer
              </Button>
            </MenubarTrigger>
            <MenubarContent
              align="start"
              className="z-50 min-w-64 p-3 text-base"
            >
              <MenubarItem>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onOpenFolder}
                  className="flex w-full justify-between text-xl"
                >
                  Åbn <Shortcut keys="ctrl+o" />
                </Button>
              </MenubarItem>

              <MenubarItem>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onCreateWorkFolder}
                  disabled={!canCreateWork}
                  className="flex w-full justify-between text-xl"
                >
                  Opret arbejdsmappe
                </Button>
              </MenubarItem>

              <MenubarSeparator className="my-2" />

              <MenubarItem>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleAltF4}
                  className="flex w-full justify-between text-xl"
                >
                  Afslut <Shortcut keys="alt+F4" />
                </Button>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger asChild>
              <Button variant="ghost" size="sm" className="h-12 text-xl">
                Om
              </Button>
            </MenubarTrigger>
            <MenubarContent align="start" className="z-50 min-w-64 p-3">
              <MenubarItem>
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-11 w-full justify-start text-xl"
                >
                  Om programmet
                </Button>
              </MenubarItem>
              <MenubarItem>
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-11 w-full justify-start text-xl"
                >
                  Hjælp
                </Button>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </header>
  );
};

export default AppMenu;
