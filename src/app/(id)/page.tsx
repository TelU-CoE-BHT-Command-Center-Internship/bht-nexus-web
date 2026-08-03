import { LandingHero } from "@/components/landing-hero/landing-hero";
import { LatestEvents } from "@/components/latest-events/latest-events";
import { LocationMap } from "@/components/location-map/location-map";
import { NewsHighlights } from "@/components/news-highlights/news-highlights";
import { Partners } from "@/components/partners/partners";
import { ResearchFocus } from "@/components/research-focus/research-focus";

export default function IndonesianHomePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <LandingHero locale="id" />
      <ResearchFocus locale="id" />
      <NewsHighlights locale="id" />
      <LatestEvents locale="id" />
      <Partners locale="id" />
      <LocationMap locale="id" />
    </main>
  );
}
