"use client";

type ExifMap = Record<string, unknown>;

export default function ImageInfo({
  path,
  exif,
}: {
  path: string | null;
  exif: ExifMap | null;
}) {
  if (!path) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Vælg et billede i venstre side
      </div>
    );
  }

  // vis nogle typiske felter først
  const preferredKeys = [
    "Make",
    "Model",
    "LensModel",
    "DateTimeOriginal",
    "CreateDate",
    "ExposureTime",
    "FNumber",
    "ISO",
    "FocalLength",
    "Orientation",
    "ImageWidth",
    "ImageHeight",
  ];

  const rows: Array<[string, string]> = [];
  if (exif) {
    for (const k of preferredKeys) {
      if (exif[k] != null) rows.push([k, String(exif[k])]);
    }
    // fyld op med resten (begrænset)
    Object.keys(exif)
      .slice(0, 40)
      .forEach((k) => {
        if (!preferredKeys.includes(k) && exif[k] != null) {
          rows.push([k, String(exif[k])]);
        }
      });
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 text-lg font-semibold">EXIF</h2>
        {rows.length ? (
          <div className="max-h-[40vh] overflow-auto">
            <table className="w-full text-sm">
              <tbody>
                {rows.map(([k, v]) => (
                  <tr key={k} className="border-b last:border-b-0">
                    <td className="w-48 py-1 pr-3 font-medium">{k}</td>
                    <td className="py-1">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Ingen EXIF fundet.
          </div>
        )}
      </div>
    </div>
  );
}
