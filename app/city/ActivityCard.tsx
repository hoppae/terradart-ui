import { useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import Image from "next/image";
import { Clock, Star } from "lucide-react";
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
    <div className="flex h-[425px] flex-col gap-2 rounded-xl border border-border bg-secondary/60 px-4 pt-4 pb-2 text-foreground shadow-sm">
      {image && (
        <div className="relative h-40 w-full">
          <Image src={image} alt={activity.name ?? "Activity image"} fill className="object-cover" />
        </div>
      )}
      <div className="space-y-1 flex-1">
        {activity.bookingLink ? (
          <a href={activity.bookingLink} target="_blank" rel="noreferrer"
            className="font-semibold line-clamp-2 hover:text-primary transition-colors"
            title={activity.name ?? "Activity"} ref={titleRef as React.Ref<HTMLAnchorElement>}>
            {activity.name ?? "Activity"}
          </a>
        ) : (
          <h3 ref={titleRef} className="text-base font-semibold line-clamp-2" title={activity.name ?? "Activity"}>
            {activity.name ?? "Activity"}
          </h3>
        )}
        <p className={`text-sm text-muted-foreground ${descriptionClamp}`}>{shortDescription}</p>
      </div>
      <div className="flex">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {activity.rating != null && (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{activity.rating.toFixed(1)}</span>
              {activity.reviewCount != null && (
                <span>({activity.reviewCount.toLocaleString()})</span>
              )}
            </span>
          )}
          {activity.minimumDuration && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{activity.minimumDuration}</span>
            </span>
          )}
        </div>
        {hasMore && onShowMore && (
          <button type="button" className="ml-auto text-sm font-semibold text-primary hover:text-primary/80"
            onClick={onShowMore}>
            Show more
          </button>
        )}
      </div>
    </div>
  );
}

