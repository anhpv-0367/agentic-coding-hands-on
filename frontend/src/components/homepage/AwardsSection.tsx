import { getAwardCategories } from "@/lib/services/awards-categories";
import AwardsHeader from "./AwardsHeader";
import AwardCard from "./AwardCard";

export default async function AwardsSection() {
  const categories = getAwardCategories();

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "80px",
      }}
    >
      <AwardsHeader />
      <div
        className="grid gap-6 grid-cols-2 lg:grid-cols-3"
        style={{ width: "100%" }}
      >
        {categories.map((category) => (
          <AwardCard key={category.slug} category={category} />
        ))}
      </div>
    </section>
  );
}
