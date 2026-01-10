import Image from "next/image";
import { Star } from "lucide-react";
import { fetchCityDetail } from "@/lib/api/cities";

type CityDetail = Awaited<ReturnType<typeof fetchCityDetail>>;

type PlaceCardProps = {
  place: NonNullable<CityDetail["places"]>[number];
  onShowMore?: () => void;
};

export function PlaceCard({ place, onShowMore }: PlaceCardProps) {
  const categories = place.categories?.map((c) => c?.name).filter(Boolean).join(", ");
  const photo = place.photos?.[0];
  const imageUrl = photo?.prefix && photo?.suffix ? `${photo.prefix}original${photo.suffix}` : null;

  return (
    <div className="flex h-[425px] flex-col gap-2 rounded-xl border border-border bg-secondary/60 px-4 pt-4 pb-2 text-foreground shadow-sm">
      {imageUrl && (
        <div className="relative h-40 w-full">
          <Image src={imageUrl} alt={place.name || "Place photo"} fill className="object-cover" />
        </div>
      )}

      <div className="space-y-1 flex-1">
        <h3 className="text-base font-semibold line-clamp-1" title={place.name || "Place"}>
          {place.name || "Unnamed place"}
        </h3>
        {categories && <p className="text-sm text-primary line-clamp-1">{categories}</p>}
        {place.description && <p className="whitespace-pre-line text-sm text-muted-foreground line-clamp-7">{place.description}</p>}
      </div>

      <div className="flex">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {place.rating != null && (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{place.rating.toFixed(1)}</span>
            </span>
          )}
        </div>
        {onShowMore && (
          <button type="button" className="ml-auto text-sm font-semibold text-primary hover:text-primary/80"
            onClick={onShowMore}>
            Show more
          </button>
        )}
      </div>
    </div>
  );
}

