import { Suspense } from "react";
import HomeClient from "./components/HomeClient";
import ActivityGridServer from "./components/ActivityGridServer";
import ActivityGridSkeleton from "./components/ActivityGridSkeleton";
import { getSiteConfigData } from "./lib/home-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  // We only wait for the Site Config so the Nav and Hero are instant.
  // The Activities move to their own async component inside Suspense.
  const siteConfig = await getSiteConfigData();

  return (
    <HomeClient initialSiteConfig={siteConfig}>
      <Suspense fallback={<ActivityGridSkeleton />}>
        <ActivityGridServer />
      </Suspense>
    </HomeClient>
  );
}
