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
  rename,
} from "@tauri-apps/plugin-fs";
import { convertFileSrc } from "@tauri-apps/api/core";
import * as exifr from "exifr";
import { dirOf, fmtTs, joinSafe, lastName, slug } from "@/lib/utils";

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
const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp, tiff, gif"]);
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
  const [baseName, setBaseName] = useState("DBC-billeder");
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

  const renameSelected = useCallback(async () => {
    if (!selected) {
      alert("Ingen fil valgt.");
      return;
    }

    try {
      // 1) find tagedato fra EXIF (fallback til nu)
      const ex = await readExifFromPath(selected);
      const dt =
        (ex?.DateTimeOriginal as Date) ||
        (ex?.CreateDate as Date) ||
        (ex?.ModifyDate as Date) ||
        new Date();

      const ts = fmtTs(dt);
      const orig = lastName(selected);
      const parent = dirOf(selected);

      // 2) nyt navn: <base>-YYYY-DD-MM_HH-MM-SS_<originalt filnavn>
      const desired = `${slug(baseName)}-${ts}_${orig}`;
      let dest = joinSafe(parent, desired);

      // 3) undgå kollisioner ved at tælle op: -1, -2, ...
      if (await exists(dest)) {
        const [stem, ext = ""] = desired.split(/(?=\.[^.]+$)/); // bevar extension
        let i = 1;
        while (await exists(dest)) {
          const candidate = `${stem}-${i}${ext}`;
          dest = joinSafe(parent, candidate);
          i++;
        }
      }

      // 4) ægte omdøbning
      await rename(selected, dest);

      // 5) UI-opdatering
      setImages((prev) => prev.map((p) => (p === selected ? dest : p)));
      setSelected(dest);
      setExif((await readExifFromPath(dest)) ?? null);
    } catch (e) {
      console.error("Omdøb-fejl:", e);
      alert("Kunne ikke omdøbe filen.");
    }
  }, [selected, baseName]);

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
            <div className="flex w-50% items-center gap-2">
              <input
                value={baseName}
                onChange={(e) => setBaseName(e.target.value)}
                placeholder="Basisnavn (fx Martins-billede)"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
              <button
                onClick={renameSelected}
                disabled={!selected}
                className="shrink-0 rounded-md border bg-background px-3 py-2 text-sm hover:bg-accent data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
              >
                Omdøb valgt
              </button>
            </div>

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
            <div className="my-10 p-2 bg-white rounded-2xl">{selected}</div>

            <ImageInfo path={selected} exif={exif} />
          </section>
        </div>
      </main>
    </>
  );
}
