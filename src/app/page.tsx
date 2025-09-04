/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useState } from "react";
import AppMenu from "@/components/AppMenu";
import ImageList from "@/components/ImageList";
import ImageInfo from "@/components/ImageInfo";
import { open } from "@tauri-apps/plugin-dialog";
import { readDir } from "@tauri-apps/plugin-fs";
import { convertFileSrc } from "@tauri-apps/api/core";
import * as exifr from "exifr";

async function readExifFromPath(path: string) {
  const url = convertFileSrc(path);
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  try {
    return await exifr.parse(buf);
  } catch {
    return null;
  }
}

type DirEntry = Awaited<ReturnType<typeof readDir>>[number];
const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp"]);
const isImage = (n: string) =>
  IMAGE_EXT.has(n.split(".").pop()?.toLowerCase() ?? "");

function flatten(entries: DirEntry[], parent: string) {
  const out: { name: string; path: string; isDirectory: boolean }[] = [];
  const stack: Array<{ e: DirEntry; parent: string }> = entries.map((e) => ({
    e,
    parent,
  }));
  while (stack.length) {
    const { e, parent } = stack.pop()!;
    const full = e.name ? `${parent}/${e.name}` : parent;
    out.push({
      name: e.name ?? full.split("/").at(-1) ?? full,
      path: full,
      isDirectory: !!e.isDirectory,
    });
    if ("children" in e && Array.isArray(e.children)) {
      for (const c of e.children) stack.push({ e: c, parent: full });
    }
  }
  return out;
}

export default function Page() {
  const [folder, setFolder] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [exif, setExif] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const loadFolder = useCallback(async (path: string) => {
    setFolder(path);
    const entries = await readDir(path);
    const flat = flatten(entries, path);
    const imgs = flat
      .filter((f) => !f.isDirectory && (isImage(f.name) || isImage(f.path)))
      .map((f) => f.path);
    setImages(imgs);
    const first = imgs[0] ?? null;
    setSelected(first);
    setExif(first ? (await readExifFromPath(first)) ?? null : null);
  }, []);

  const openFolder = useCallback(async () => {
    const picked = await open({ directory: true, multiple: false });
    if (!picked || Array.isArray(picked)) return;
    setLoading(true);
    try {
      await loadFolder(picked);
      localStorage.setItem("badger:lastFolder", picked);
    } finally {
      setLoading(false);
    }
  }, [loadFolder]);

  const onSelect = useCallback(async (p: string) => {
    setSelected(p);
    setExif((await readExifFromPath(p)) ?? null);
  }, []);

  useEffect(() => {
    const last = localStorage.getItem("badger:lastFolder");
    if (last) {
      setLoading(true);
      loadFolder(last).finally(() => setLoading(false));
    }
  }, [loadFolder]);

  return (
    <>
      <AppMenu onOpenFolder={openFolder} />

      <main className="mx-auto mt-6 max-w-[1600px] px-6">
        <div className="flex gap-4" style={{ minHeight: "calc(100vh - 9rem)" }}>
          <aside
            className="border-r bg-card p-3"
            style={{
              width: 460, // hård bredde
              flexShrink: 0, // må ikke kollapse
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="mb-2 truncate text-xs text-muted-foreground">
              {folder ?? "Ingen mappe valgt"}
            </div>

            <div style={{ overflow: "auto", maxHeight: "100%" }}>
              {loading ? (
                <div className="p-4 text-sm text-muted-foreground">Loader…</div>
              ) : (
                <ImageList
                  images={images}
                  selected={selected}
                  onSelect={onSelect}
                />
              )}
            </div>
          </aside>

          <section
            className="min-w-0 flex-1 grid gap-4"
            style={{ gridTemplateRows: "auto 1fr" }}
          >
            <div className="flex h-[60vh] items-center justify-center rounded-lg border bg-background p-4">
              {selected && (
                <img
                  src={convertFileSrc(selected)}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                  draggable={false}
                />
              )}
            </div>

            <div className="min-h-[280px]">
              <ImageInfo path={selected} exif={exif} />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
