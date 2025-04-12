import ImageGenerator from "@/components/imggen";

export const metadata = {
  title: "AI Image Generator",
  description: "Generate images using AI with your text prompts",
};

export default function ImageGeneratorPage() {
  return (
    <div className="min-h-screen py-12">
      <ImageGenerator />
    </div>
  );
}
