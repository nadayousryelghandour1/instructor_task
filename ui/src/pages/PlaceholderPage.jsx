import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";

// Stands in for screens that are designed but not built yet, so navigation never dead-ends.
export default function PlaceholderPage({ title }) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState
        title="This screen isn't built yet"
        description="It's next in the build order."
        sx={{ border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "background.paper" }}
      />
    </>
  );
}
