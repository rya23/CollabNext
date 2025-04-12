import ComicGenerator from "@/components/comicgen";

export const metadata = {
  title: "Comic Strip Generator",
  description: "Generate comic strips from your story ideas using AI",
};

export default function ComicGeneratorPage() {
  return (
    <div className="min-h-screen py-12">
      <ComicGenerator />
    </div>
  );
}
