import { useEffect, useMemo, useState } from "react";
import { ScrollText, X } from "lucide-react";
import { fetchCityDetail } from "@/lib/api/cities";

type Place = NonNullable<Awaited<ReturnType<typeof fetchCityDetail>>["places"]>[number];

export function PlaceModal({ place, onClose }: { place: Place; onClose: () => void }) {
  const images = useMemo(() => {
    if (!place.photos || place.photos.length === 0) return [] as string[];
    return place.photos
      .map((photo) => (photo.prefix && photo.suffix ? `${photo.prefix}original${photo.suffix}` : undefined))
      .filter(Boolean) as string[];
  }, [place.photos]);

  const categories = place.categories?.map((c) => c?.name).filter(Boolean).join(", ");
  const address = place.location?.formatted_address || place.location?.address || [place.location?.locality, place.location?.country].filter(Boolean).join(", ");
  const hoursDisplay = place.hours?.display;
  const openNow = place.hours?.open_now;
  // const tastes = place.tastes?.slice(0, 5) ?? [];

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
      <div className="flex flex-col rounded-none bg-card shadow-2xl sm:rounded-xl font-sans
        h-full sm:h-[95vh] xl:h-[90vh] 2xl:h-[65vh]
        w-full sm:max-w-4xl md:w-3xl lg:w-2xl 2xl:w-3xl"
        onClick={(event) => event.stopPropagation()}>
        <div className="pl-4 pr-2 py1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs font-semibold text-primary">
              <ScrollText className="h-5 w-5"/>
              <span>PLACE DETAILS</span>
            </div>
            <button
              type="button"
              className="p-2 rounded-full text-primary hover:border-primary hover:bg-accent"
              aria-label="Close dialog"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 pr-1 text-sm text-card-foreground">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground mb-0">{place.name ?? "Place"}</h2>
            {categories && <p className="text-sm text-primary">{categories}</p>}
            {images.length > 0 && (
              <div className="space-y-2">
                <div className="relative overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="w-full object-cover h-60 sm:h-80 xl:h-100" src={images[photoIndex]} alt={place.name ?? "Place image"}/>
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
                      <button
                        type="button"
                        className={`h-12 w-12 overflow-hidden rounded ${
                          idx === photoIndex ? "border border-primary ring-2 ring-ring" : ""
                        }`}
                        key={src + idx}
                        onClick={() => setPhotoIndex(idx)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="h-full w-full object-cover" src={src} alt="thumbnail" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3 pb-4 leading-relaxed">
            {place.description && <p>{place.description}</p>}

            {hoursDisplay && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-primary">Hours</p>
                <p className="text-sm text-card-foreground">
                  {openNow !== undefined && (
                    <span className={openNow ? "text-primary font-semibold" : "text-destructive font-semibold"}>
                      {openNow ? "Open now" : "Closed"}
                    </span>
                  )}
                  {openNow !== undefined && " • "}
                  {hoursDisplay}
                </p>
              </div>
            )}

            {address && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-primary">Address</p>
                <p className="text-sm text-card-foreground">{address}</p>
              </div>
            )}

            {place.tel && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-primary">Phone</p>
                <p className="text-sm text-card-foreground">{place.tel}</p>
              </div>
            )}

          </div>
        </div>

        <div className="mt-auto flex justify-between px-4 py-2">
            {place.website && (
              <a className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-3 py-2 text-sm
                font-medium text-primary transition hover:border-primary hover:bg-accent"
                href={place.website} target="_blank" rel="noreferrer">
                Visit website
              </a>
            )}
          <button type="button" className="rounded-full border border-border px-3 py-2 text-sm font-medium text-primary
            hover:border-primary hover:bg-accent"
            onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

