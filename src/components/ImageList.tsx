/* eslint-disable @next/next/no-img-element */
"use client";

import { convertFileSrc } from "@tauri-apps/api/core";

export default function ImageList({
  images,
  selected,
  onSelect,
}: {
  images: string[];
  selected: string | null;
  onSelect: (path: string) => void;
}) {
  if (!images.length) {
    return (
      <div className="p-4 text-sm text-muted-foreground">Ingen billeder</div>
    );
  }

  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
    >
      {images.map((p) => {
        const name = p.split("/").at(-1) ?? p;
        const active = selected === p;
        return (
          <button
            key={p}
            onClick={() => onSelect(p)}
            title={name}
            className={`group relative w-[128px] h-[128px] overflow-hidden rounded-md border ${
              active ? "ring-2 ring-primary" : ""
            }`}
          >
            <img
              src={convertFileSrc(p)}
              alt={name}
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
          </button>
        );
      })}
    </div>
  );
}
