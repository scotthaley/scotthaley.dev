import Campaign from "./Campaign";

export default async function DND({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;

  return <Campaign slug={slug} />;
}
