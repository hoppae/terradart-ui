import Link from "next/link";
import { Landmark, MapPinned, TentTree, ArrowLeft, BottleWine } from "lucide-react";
import { ActivitiesSkeletonGrid, LocationSkeleton, OverviewSkeleton, PlacesSkeletonGrid } from "../Skeletons";

export default function CityLoading() {
  return (
    <div className="min-h-screen bg-background px-4 md:px-8 py-3 font-sans text-foreground">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between pb-1 md:pb-2">
        <p className="tracking-[0.1em] text-primary text-lg">TERRADART</p>
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80">
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-6">
        <section className="flex flex-wrap items-baseline mb-4">
          <div>
            <h1 className="text-4xl font-semibold leading-tight mb-1">
              <span className="inline-block h-10 w-48 animate-pulse rounded bg-muted" />
            </h1>
            <div className="flex items-center gap-2 text-lg text-muted-foreground ml-[2px]">
              <span className="inline-block h-6 w-8 animate-pulse rounded bg-muted" />
              <span className="inline-block h-5 w-32 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-5 shadow-sm h-[24rem]">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
              <Landmark className="h-5 w-5" />
              Overview
            </div>
            <OverviewSkeleton />
          </article>

          <article className="rounded-2xl border border-border bg-card p-5 shadow-sm h-[24rem]">
            <div className="mb-1 sm:mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
              <MapPinned className="h-5 w-5" />
              Location
            </div>
            <LocationSkeleton />
          </article>

          <article className="md:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
              <TentTree className="h-5 w-5" />
              Activities
            </div>
            <ActivitiesSkeletonGrid count={4} />
          </article>

          <article className="md:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
              <BottleWine className="h-5 w-5" />
              Places
            </div>
            <PlacesSkeletonGrid count={4} />
          </article>
        </section>
      </main>
    </div>
  );
}
