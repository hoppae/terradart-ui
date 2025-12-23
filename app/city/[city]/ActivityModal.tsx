import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { fetchCityDetail } from "@/lib/api/cities";

export function ActivityModal({
  activity,
  onClose,
}: {
  activity: NonNullable<Awaited<ReturnType<typeof fetchCityDetail>>["activities"]>[number];
  onClose: () => void;
}) {
  const description = activity.description || activity.shortDescription || "No description provided.";
  const price = activity.price?.amount && activity.price?.currencyCode ? `${activity.price.amount} ${activity.price.currencyCode}`
      : activity.price?.amount ?? "N/A";
  const images = activity.pictures ?? [];
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-0 sm:px-4"
      onClick={onClose}>
      <div className="flex h-full max-h-full w-full flex-col rounded-none bg-white py-2 shadow-2xl
          sm:h-[95vh] sm:max-h-[95vh] sm:max-w-5xl sm:rounded-xl md:h-[90vh] md:max-h-[90vh] lg:h-[80vh] lg:max-h-[80vh]"
        onClick={(event) => event.stopPropagation()}>
        <div className="px-4">
          <div className="flex justify-between">
            <p className="text-sm uppercase tracking-wide text-emerald-700 self-center">
              Activity details
            </p>
            <button type="button" className="flex items-center justify-center rounded-full border border-emerald-200 p-2 text-sm font-semibold
              text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50" aria-label="Close dialog" onClick={onClose}>
              <X className="h-3 w-3" />
            </button>
          </div>
          <h2 className="text-2xl font-semibold text-zinc-900 line-clamp-2 pr-[32px]" title={activity.name ?? "Activity"}>
            {activity.name ?? "Activity"}
          </h2>
        </div>

        <div className="mt-4 flex-1 space-y-3 overflow-y-auto px-4 pr-1 text-sm text-zinc-800">
          {images.length > 0 && (
            <div className="space-y-2">
              <div className="relative overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-full object-cover" src={images[photoIndex]} alt={activity.name ?? "Activity image"} loading="lazy"/>
                {images.length > 1 && (
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/40 px-3 py-1 text-xs text-white">
                    <span>
                      {photoIndex + 1} / {images.length}
                    </span>
                    <div className="flex gap-2">
                      <button type="button" className="rounded bg-white/30 px-2 py-1 hover:bg-white/50"
                        onClick={() => setPhotoIndex((i) => (i - 1 + images.length) % images.length)}>
                        Prev
                      </button>
                      <button type="button" className="rounded bg-white/30 px-2 py-1 hover:bg-white/50"
                        onClick={() => setPhotoIndex((i) => (i + 1) % images.length)}>
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {images.map((src, idx) => (
                    <button type="button" className={`h-12 w-12 overflow-hidden rounded
                      ${idx === photoIndex ? "border border-emerald-500 ring-2 ring-emerald-200" : ""}`}
                      key={src + idx} onClick={() => setPhotoIndex(idx)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="h-full w-full object-cover" src={src} alt="thumbnail"/>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* HTML comes from a trusted source and is additionally sanitized by API. */}
          <div className="leading-relaxed pb-4" dangerouslySetInnerHTML={{ __html: description }}></div>

        </div>

        <div className="mt-auto flex justify-between px-4 pt-2">
          <div className="flex items-center gap-3">
            {activity.bookingLink && (
              <a className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 px-3 py-2 text-sm font-medium
                text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                href={activity.bookingLink} target="_blank" rel="noreferrer">
                Book activity
              </a>
            )}
            <span className="text-sm font-medium text-emerald-700">Price: {price}</span>
          </div>
          <button type="button" className="rounded-full border border-emerald-200 px-3 py-2 text-sm font-medium
            text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50"
            onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

