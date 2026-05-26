import { getActivitiesData, getPackagesData, getSiteConfigData } from "../lib/home-data";
import ActivityGrid from "./ActivityGrid";
import BuildYourOwnCombo from "./BuildYourOwnCombo";

export default async function ActivityGridServer() {
  const [activities, packages, siteConfig] = await Promise.all([
    getActivitiesData(),
    getPackagesData(),
    getSiteConfigData(),
  ]);

  return (
    <ActivityGrid
      activities={activities}
      packages={packages}
      selectedId={null}
      comboCta={
        <BuildYourOwnCombo
          activities={activities}
          siteName={siteConfig?.general?.siteName || siteConfig?.siteName}
          whatsapp={siteConfig?.social?.whatsapp}
          contactEmail={siteConfig?.contactEmail || siteConfig?.general?.contactEmail}
          contactPhone={siteConfig?.contactPhone || siteConfig?.general?.contactPhone}
        />
      }
    />
  );
}
