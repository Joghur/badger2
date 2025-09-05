/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useState } from "react";
import AppMenu from "@/components/AppMenu";
import ImageList from "@/components/ImageList";
import ImageInfo from "@/components/ImageInfo";
import { open } from "@tauri-apps/plugin-dialog";
import {
  readDir,
  mkdir,
  exists,
  copyFile,
  readFile,
  writeFile,
} from "@tauri-apps/plugin-fs";
import { convertFileSrc } from "@tauri-apps/api/core";
import * as exifr from "exifr";
import { joinSafe, lastName } from "@/lib/utils";

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
    const name: string | undefined = e.name;
    const full = name ? joinSafe(parent, name) : parent;
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

  const createWorkFolderAndCopy = useCallback(async () => {
    if (!folder || images.length === 0) {
      alert("Ingen mappe eller ingen viste billeder.");
      return;
    }

    // Navn på arbejdsmappe (subfolder i den valgte mappe)
    const WORK_SUBDIR = "_badger_work";
    const workDir = joinSafe(folder, WORK_SUBDIR);

    try {
      await mkdir(workDir, { recursive: true });
    } catch (e) {
      console.error("Kunne ikke oprette arbejdsmappe:", e);
      alert("Kunne ikke oprette arbejdsmappe.");
      return;
    }

    let copied = 0,
      skipped = 0,
      errors = 0;
    const destPaths: string[] = [];

    for (const src of images) {
      const dest = joinSafe(workDir, lastName(src));
      try {
        if (await exists(dest)) {
          skipped++;
          destPaths.push(dest);
          continue;
        }

        // hurtigst: copyFile – hvis den fejler i din version, falder vi tilbage til read+write
        try {
          await copyFile(src, dest);
        } catch {
          const data = await readFile(src);
          await writeFile(dest, data);
        }

        copied++;
        destPaths.push(dest);
      } catch (e) {
        console.error("Kopi-fejl for", src, e);
        errors++;
      }
    }

    // Skift visningen til arbejds-mappen, så vi arbejder på kopierne
    if (destPaths.length > 0) {
      setFolder(workDir);
      setImages(destPaths);
      setSelected(destPaths[0] ?? null);
      setExif(
        destPaths[0] ? (await readExifFromPath(destPaths[0])) ?? null : null
      );
    }

    alert(
      `Arbejdsmappe: ${workDir}\nKopieret: ${copied}\nAllerede fandtes: ${skipped}\nFejl: ${errors}`
    );
  }, [folder, images, joinSafe]);

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
      <AppMenu
        onOpenFolder={openFolder}
        onCreateWorkFolder={createWorkFolderAndCopy}
        canCreateWork={!!folder && images.length > 0}
      />

      <main className="mx-auto mt-6 max-w-[1600px] px-6">
        <div className="flex gap-4">
          <aside className="border-r bg-card p-3">
            <div className="mb-2 truncate text-xs text-muted-foreground">
              {folder ?? "Ingen mappe valgt"}
            </div>

            <div>
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

          <section className="flex flex-col items-center justify-center min-w-0 flex-1 gap-4">
            <div className="w-auto h-[500px] rounded-lg border bg-background p-4">
              {selected && (
                <img
                  src={convertFileSrc(selected)}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                  draggable={false}
                />
              )}
            </div>

            <ImageInfo path={selected} exif={exif} />
          </section>
        </div>
      </main>
    </>
  );
}
