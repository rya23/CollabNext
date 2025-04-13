import SketchGenerator from "@/components/sketchgen";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Sketch to Image Generator",
  description: "Transform your sketches into detailed images using AI",
};

export default function SketchGeneratorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#030303]">
      <Navbar />
      <div className="container flex flex-1 flex-col mx-auto bg-[#030303] pt-24 pb-12">
        <SketchGenerator />
      </div>
      <Footer />
    </div>
  );
}
