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

const AppMenu = () => {
  const handleCtrlN = (event: React.KeyboardEvent | React.MouseEvent) => {
    event.preventDefault();
    console.log("dfuhdsiuhfk");
  };
  const handleCtrlO = (event: React.KeyboardEvent | React.MouseEvent) => {
    event.preventDefault();
    console.log("dfuhdwefwefsiuhfk");
  };
  const handleCtrlS = (event: React.KeyboardEvent | React.MouseEvent) => {
    event.preventDefault();
    console.log("sadfwf");
  };

  const handler = useKeyPress<HTMLElement>({
    n: [(event) => handleCtrlN(event), ["Control"]],
    s: [(event) => handleCtrlS(event), ["Control"]],
    o: [(event) => handleCtrlO(event), ["Control"]],
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => handler(e);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handler]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-3">
        <Menubar className="rounded-xl border bg-card/90 p-2 shadow-sm text-base">
          <MenubarMenu>
            <MenubarTrigger asChild>
              <Button
                variant="secondary"
                size="lg"
                className="inline-flex items-center justify-center px-4 py-2 text-base"
              >
                Filer
              </Button>
            </MenubarTrigger>
            <MenubarContent
              align="start"
              className="z-50 min-w-64 p-3 text-base flex"
            >
              <MenubarItem asChild>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={(event) => handleCtrlN(event)}
                  className="h-11 w-full justify-between"
                >
                  Ny <Shortcut keys={`CTRL+N`} />
                </Button>
              </MenubarItem>
              <MenubarItem asChild>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={(event) => handleCtrlO(event)}
                  className="h-11 w-full justify-between"
                >
                  Åbn <Shortcut keys={`CTRL+O`} />
                </Button>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem asChild>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={(event) => handleCtrlS(event)}
                  className="h-11 w-full justify-between"
                >
                  Gem <Shortcut keys={`CTRL+S`} />
                </Button>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem asChild>
                <Button
                  variant="destructive"
                  size="lg"
                  className="h-11 w-full justify-between"
                >
                  Afslut <Shortcut keys={`CTRL+Q`} />
                </Button>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger asChild>
              <Button
                variant="secondary"
                size="lg"
                className="inline-flex items-center justify-center px-4 py-2 text-base"
              >
                Om
              </Button>
            </MenubarTrigger>
            <MenubarContent
              align="start"
              className="z-50 min-w-64 p-3 text-base"
            >
              <MenubarItem asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 w-full justify-start"
                >
                  Om programmet
                </Button>
              </MenubarItem>
              <MenubarItem asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 w-full justify-start"
                >
                  Licens
                </Button>
              </MenubarItem>
              <MenubarItem asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 w-full justify-start"
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
