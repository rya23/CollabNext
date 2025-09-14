"use client";
import AboutUsSection from "@/components/AboutUsSection";
import HeroGeometric from "@/components/kokonutui/hero-geometric";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen  ">
            <Navbar />
            <div className="container flex flex-1 flex-col mx-auto  ">
                <HeroGeometric badge="NUCLITRON" title1="CollabNext" title2="A Seam-less collaborative Text Editor" />
                <AboutUsSection />
            </div>
            <Footer />
        </div>
    );
}
