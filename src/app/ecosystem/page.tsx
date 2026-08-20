import Link from "next/link";
import { FaFilm, FaRobot, FaMusic, FaUsers, FaPenFancy, FaBullhorn } from "react-icons/fa";

export default function EcosystemPage() {
  const ecosystemItems = [
    { icon: <FaFilm className="text-red-500 w-8 h-8" />, name: "Movies", desc: "Stream, rent, and buy movies using Ratel Coin." },
    { icon: <FaRobot className="text-red-500 w-8 h-8" />, name: "AI Tools", desc: "Access powerful AI tools for creativity and productivity." },
    { icon: <FaMusic className="text-red-500 w-8 h-8" />, name: "Music", desc: "Listen, discover, and support your favorite artists." },
    { icon: <FaUsers className="text-red-500 w-8 h-8" />, name: "Social Media", desc: "Connect, share, and earn rewards for your social engagement." },
    { icon: <FaPenFancy className="text-red-500 w-8 h-8" />, name: "Blogging", desc: "Create, publish, and monetize your content with Ratel Coin." },
    { icon: <FaBullhorn className="text-red-500 w-8 h-8" />, name: "Marketing", desc: "Promote your brand with targeted marketing solutions." },
  ];

  return (

      <main className="max-w-7xl mx-auto px-6 py-26">
        <div className="text-center mb-16">
          <div className="inline-block bg-red-50 px-4 py-1.5 rounded-full text-xs font-semibold text-red-600 border border-red-100 mb-4">🚀 BUILT FOR PASSION</div>
          <h1 className="text-4xl md:text-5xl font-bold">One Ecosystem. Unlimited Possibilities.</h1>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Ratel Coin connects the future of entertainment, technology, and digital solutions in one powerful decentralized ecosystem.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ecosystemItems.map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition text-center">
              <div className="flex justify-center mb-4">{item.icon}</div>
              <h4 className="font-bold text-lg">{item.name}</h4>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">{item.desc}</p>
              <div className="mt-4 text-sm text-red-600 font-medium hover:underline cursor-pointer">Explore {item.name} →</div>
            </div>
          ))}
        </div>
      </main>
  );
}