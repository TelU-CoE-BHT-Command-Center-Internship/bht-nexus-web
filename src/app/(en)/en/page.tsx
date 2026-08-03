import { LandingHero } from "@/components/landing-hero/landing-hero";
import { LatestEvents } from "@/components/latest-events/latest-events";
import { LocationMap } from "@/components/location-map/location-map";
import { NewsHighlights } from "@/components/news-highlights/news-highlights";
import { Partners } from "@/components/partners/partners";
import { ResearchFocus } from "@/components/research-focus/research-focus";

export default function EnglishHomePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <LandingHero locale="en" />
      <ResearchFocus locale="en" />
      <NewsHighlights locale="en" />
      <LatestEvents locale="en" />
      <Partners locale="en" />
      <LocationMap locale="en" />
    </main>
  );
}
