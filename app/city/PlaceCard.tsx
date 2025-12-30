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
    <div className="flex h-[425px] flex-col gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 pt-4 pb-2 text-zinc-800 shadow-sm">
      {imageUrl && (
        <div className="relative rounded-lg border border-emerald-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={place.name || "Place photo"}
            className="h-40 w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="space-y-1 flex-1">
        <h3 className="text-base font-semibold line-clamp-1" title={place.name || "Place"}>
          {place.name || "Unnamed place"}
        </h3>
        {categories && <p className="text-sm text-emerald-700 line-clamp-1">{categories}</p>}
        {place.description && <p className="text-sm text-zinc-700 line-clamp-7">{place.description}</p>}
      </div>

      <div className="flex justify-end">
        {onShowMore && (
          <button type="button" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            onClick={onShowMore}>
            Show more
          </button>
        )}
      </div>
    </div>
  );
}

