import { useEffect, useState } from "react";
import Image from "next/image";
import { Clock, ScrollText, Star, X } from "lucide-react";
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
      <div className="flex flex-col rounded-none bg-card shadow-2xl sm:rounded-xl font-sans
        h-full sm:h-auto sm:max-h-[95vh] w-full sm:max-w-4xl md:w-3xl lg:w-2xl 2xl:w-3xl"
        onClick={(event) => event.stopPropagation()}>
        <div className="pl-4 pr-[2px] py-[2px]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-3 text-sm font-semibold text-primary">
              <ScrollText className="h-5 w-5"/>
              <span>ACTIVITY DETAILS</span>
            </div>
            <button type="button" className="p-2 rounded-full text-primary hover:border-primary hover:bg-accent"
              aria-label="Close dialog" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 text-card-foreground">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              {activity.name ?? "Activity"}
            </h2>
            {(activity.rating != null || activity.minimumDuration) && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {activity.rating != null && (
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-foreground">{activity.rating.toFixed(1)}</span>
                    {activity.reviewCount != null && (
                      <span>({activity.reviewCount.toLocaleString()} reviews)</span>
                    )}
                  </span>
                )}
                {activity.minimumDuration && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{activity.minimumDuration}</span>
                  </span>
                )}
              </div>
            )}
            {images.length > 0 && (
              <div className="space-y-2">
                <div className="relative overflow-hidden rounded-lg h-60 sm:h-80 xl:h-100">
                  <Image src={images[photoIndex]} alt={activity.name ?? "Activity image"} fill className="object-cover" />
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
                      <button type="button" className={`relative h-12 w-12 overflow-hidden rounded
                        ${idx === photoIndex ? "border border-primary ring-2 ring-ring" : ""}`}
                        key={src + idx} onClick={() => setPhotoIndex(idx)}>
                        <Image src={src} alt="thumbnail" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="whitespace-pre-line pb-2">{description}</p>
        </div>

        <div className="mt-auto flex justify-between px-3 py-2">
          <div className="flex items-center gap-3">
            {activity.bookingLink && (
              <a className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-medium
                text-primary transition hover:border-primary hover:bg-accent"
                href={activity.bookingLink} target="_blank" rel="noreferrer">
                Book activity
              </a>
            )}
            <span className="text-sm font-medium text-primary">Price: {price}</span>
          </div>
          <button type="button" className="rounded-full border border-border px-3 py-2 text-sm font-medium
            text-primary hover:border-primary hover:bg-accent"
            onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

