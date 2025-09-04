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
    console.log("handleCtrlN");
  };
  const handleCtrlO = (event: React.KeyboardEvent | React.MouseEvent) => {
    event.preventDefault();
    console.log("handleCtrlO");
  };
  const handleCtrlS = (event: React.KeyboardEvent | React.MouseEvent) => {
    event.preventDefault();
    console.log("handleCtrlS");
  };
  const handleAltF4 = (event: React.KeyboardEvent | React.MouseEvent) => {
    event.preventDefault();
    console.log("handleAltF4");
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
                className="h-12 px-6 text-lg"
              >
                Filer
              </Button>
            </MenubarTrigger>
            <MenubarContent
              align="start"
              className="z-50 w-[36rem] p-3 text-base"
            >
              <div className="w-[36rem] max-w-none flex flex-col gap-2">
                <MenubarItem>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleCtrlN}
                    className="!flex w-full justify-between"
                  >
                    Ny <Shortcut keys="- (CTRL+N)" />
                  </Button>
                </MenubarItem>

                <MenubarItem>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleCtrlO}
                    className="!flex w-full justify-between"
                  >
                    Åbn <Shortcut keys="- (CTRL+O)" />
                  </Button>
                </MenubarItem>

                <div className="my-1 h-px bg-border" />

                <MenubarItem>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleCtrlS}
                    className="!flex w-full justify-between"
                  >
                    Gem <Shortcut keys="- (CTRL+S)" />
                  </Button>
                </MenubarItem>

                <div className="my-1 h-px bg-border" />

                <MenubarItem>
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={handleAltF4}
                    className="!flex w-full justify-between"
                  >
                    Afslut <Shortcut keys="Alt+F4" />
                  </Button>
                </MenubarItem>
              </div>
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
              <MenubarItem>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 w-full justify-start"
                >
                  Om programmet
                </Button>
              </MenubarItem>
              <MenubarItem>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 w-full justify-start"
                >
                  Licens
                </Button>
              </MenubarItem>
              <MenubarItem>
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
