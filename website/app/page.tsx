import AboutUsSection from "@/components/AboutUsSection";
import HeroGeometric from "@/components/kokonutui/hero-geometric";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#030303]">
      <Navbar />
      <div className="container flex flex-1 flex-col mx-auto bg-[#030303]">
        <HeroGeometric
          badge="NUCLITRON"
          title1="CollabNext"
          title2="A project for KJ Hackathon"
        />
        <AboutUsSection />
      </div>
      <Footer />
    </div>
  );
}
