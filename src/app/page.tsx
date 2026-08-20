// app/page.tsx
import Navbar from "./components/navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Features from "./components/Features";
import Ecosystem from "./components/Ecosystem";
import Comparison from "./components/Comparison";
import Security from "./components/Security";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function HomePage() {
  return (
    <main className="bg-white text-gray-900 overflow-x-hidden">
      <Navbar />
      <div className="pt-16">
        <Hero delay={0.05} />
        <Stats delay={0.15} />
        <Features delay={0.25} />
        <Ecosystem delay={0.35} />
        <Comparison delay={0.45} />
        <Security delay={0.55} />
        <CTA delay={0.65} />

        {/* Footer – usually not animated, but you can wrap it too if desired */}
        <Footer />
      </div>
    </main>
  );
}