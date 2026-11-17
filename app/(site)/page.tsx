import { HomeView } from "@/components/home/home-view";
import { getCatalogue, getFeatured } from "@/lib/catalogue/catalogue";

/* Homepage: the approved layout (/design-preview/home) on published products only. */
export default async function HomePage() {
  const [featured, free] = await Promise.all([
    getFeatured(),
    getCatalogue({ cost: "free", sort: "newest" }),
  ]);
  return <HomeView featured={featured} free={free.items.slice(0, 4)} />;
}
