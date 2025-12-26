import { useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { fetchCityDetail } from "@/lib/api/cities";

const useLineCount = (ref: RefObject<HTMLElement | null>, trigger?: unknown) => {
  const [lineCount, setLineCount] = useState(2);

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const node = ref.current;
    if (!node) {
      return;
    }

    const updateLineCount = () => {
      const target = ref.current;
      if (!target) {
        return;
      }
      const computed = window.getComputedStyle(target);
      const lineHeight = parseFloat(computed.lineHeight);
      if (!lineHeight) {
        return;
      }
      const lines = Math.max(1, Math.round(target.clientHeight / lineHeight));
      setLineCount((prev) => (prev === lines ? prev : lines));
    };

    const scheduleUpdate = () => {
      window.requestAnimationFrame(updateLineCount);
    };

    scheduleUpdate();

    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(scheduleUpdate) : null;
    if (observer) {
      observer.observe(node);
    }

    window.addEventListener("resize", scheduleUpdate);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [ref, trigger]);

  return lineCount;
};

type CityDetail = Awaited<ReturnType<typeof fetchCityDetail>>;
type ActivityCardProps = {
  activity: NonNullable<CityDetail["activities"]>[number];
  image?: string;
  shortDescription: string;
  hasMore: boolean;
  onShowMore?: () => void;
};

export function ActivityCard({ activity, image, shortDescription, hasMore, onShowMore }: ActivityCardProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleLines = useLineCount(titleRef, activity.name);
  const descriptionClamp = titleLines <= 1 ? "line-clamp-8" : "line-clamp-7";

  return (
    <div className="flex h-[425px] flex-col gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 pt-4 pb-2 text-zinc-800 shadow-sm">
      {image && (
        <div className="rounded-lg border border-emerald-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="h-40 w-full object-cover" src={image} alt={activity.name ?? "Activity image"} loading="lazy"/>
        </div>
      )}
      <div className="space-y-1 flex-1">
        <h3 ref={titleRef} className="text-base font-semibold line-clamp-2" title={activity.name ?? "Activity"}>
          {activity.name ?? "Activity"}
        </h3>
        <p className={`text-sm text-zinc-700 ${descriptionClamp}`}>{shortDescription}</p>
      </div>
      <div className="flex justify-end">
        {hasMore && onShowMore && (
          <button type="button" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            onClick={onShowMore}>
            Show more
          </button>
        )}
      </div>
    </div>
  );
}

