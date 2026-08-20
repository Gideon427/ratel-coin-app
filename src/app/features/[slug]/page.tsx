
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaBolt, FaWallet, FaRobot, FaCoins, FaGlobe, FaUsers } from "react-icons/fa6";

// Define the 6 features with long, detailed descriptions
const featuresData = [
  {
    slug: "lightning-fast-transactions",
    title: "Lightning Fast Transactions",
    icon: FaBolt,
    fullDescription: (
      <div className="space-y-8">
        <section className="space-y-6">
          <p>
            Experience transaction speed that feels instantaneous. Ratel Coin uses optimized blockchain
            propagation and advanced consensus techniques to finalize transfers quickly, without
            sacrificing security. This is not just faster checkout — it is a system built so that
            payments move with the pace of modern business.
          </p>
          <p>
            The network learns from load patterns, routing value through the most efficient
            paths while minimizing confirmations. That means lower latency for every user interaction,
            and near real-time settlement for payroll, subscriptions, and cross-border commerce.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Optimized for high-volume use</h2>
          <p>
            Because speed matters most when value is moving in large volume, Ratel Coin is engineered
            for sustained throughput. Whether you are processing thousands of micropayments a day or
            sending a single large transfer, the system maintains performance under pressure.
          </p>
          <p>
            Support for batching, instant retries, and adaptive congestion controls means every
            transfer keeps moving. This is ideal for creators, marketplaces, and financial services
            that demand both reliability and breakneck speed.
          </p>
        </section>
      </div>
    ),
  },
  {
    slug: "ai-powered-ecosystem",
    title: "AI Powered Ecosystem",
    icon: FaRobot,
    fullDescription: (
      <div className="space-y-8">
        <section className="space-y-6">
          <p>
            Ratel Coin brings AI into every layer of the ecosystem. From smart transaction routing
            to predictive analytics for portfolio management, our platform makes intelligent decisions
            in real time so users can focus on growth instead of manual trading.
          </p>
          <p>
            The network learns from user behavior and market signals to suggest optimized paths,
            reduce fees, and highlight opportunities. This means faster onboarding, smarter trading,
            and automated workflows that adapt to changing conditions.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Smart tools for everyone</h2>
          <p>
            AI features are available across the wallet, dashboard, and developer stack. Creators can
            use built-in recommendation engines to personalize content offers, while businesses can
            automate invoice reconciliation and treasury operations.
          </p>
          <p>
            By connecting tokenized assets to machine learning models, Ratel Coin creates a richer
            ecosystem where payments, identity, and automation work seamlessly together. It is
            not just a currency — it is a platform for the next generation of digital services.
          </p>
        </section>
      </div>
    ),
  },
  {
    slug: "low-transaction-fees",
    title: "Low Transaction Fees",
    icon: FaCoins,
    fullDescription: (
      <div className="space-y-8">
        <section className="space-y-6">
          <p>
            High gas fees are a thing of the past. Ratel Coin employs advanced layer-2 scaling
            solutions that reduce transaction costs by over 90% compared to traditional blockchains.
            This makes everyday transfers, micropayments, and business payouts far more affordable.
          </p>
          <p>
            Our fee system is transparent and predictable, so users never face surprise charges.
            It supports dynamic batching and fee optimization, which means the network can process
            large volumes at a fraction of the typical cost.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Designed for creators and commerce</h2>
          <p>
            Ratel Coin's low-fee model is ideal for digital creators, marketplaces, gaming platforms,
            and global remittances. It removes the barrier of expensive transaction costs so small
            payments can scale naturally.
          </p>
          <p>
            Merchants can now accept decentralized payments without passing high processing costs
            to customers, and developers can build tokenized applications without fee friction.
            That means more revenue stays with the people who use the network.
          </p>
        </section>
      </div>
    ),
  },
  {
    slug: "global-accessibility",
    title: "Global Accessibility",
    icon: FaGlobe,
    fullDescription: (
      <div className="space-y-8">
        <section className="space-y-6">
          <p>
            Break down international borders with Ratel Coin. Our decentralized network operates
            24/7/365, allowing users in over 150 countries to access their funds instantly without
            relying on traditional banking hours or foreign exchange fees.
          </p>
          <p>
            The platform is designed to support local compliance while remaining globally interoperable.
            That means users can move value between jurisdictions effortlessly, with support for
            multiple fiat on-ramps and regional payment partners.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Built for everywhere</h2>
          <p>
            Ratel Coin supports multiple languages, currencies, and accessibility tools so every user
            can participate. From mobile-first markets to large enterprise deployments, our network
            adapts to the local context without limiting global reach.
          </p>
          <p>
            This global accessibility also extends to developers and partners. Our APIs and SDKs make
            it easy to integrate payments and wallet experiences into apps anywhere in the world.
            That means more people can use digital finance without being blocked by geography.
          </p>
        </section>
      </div>
    ),
  },
  {
    slug: "secure-digital-wallet",
    title: "Secure Digital Wallet",
    icon: FaWallet,
    fullDescription: (
      <div className="space-y-8">
        <section className="space-y-6">
          <p>
            Your digital assets deserve enterprise-grade protection. Ratel Coin's wallet is designed to keep your private keys secure with multiple layers of cryptographic defense. Every session is guarded by biometric authentication, PIN protection, and optional hardware key integration.
          </p>
          <p>
            We separate sensitive signing operations from everyday browsing, so even if your device is compromised, your funds stay safe. The wallet also supports time-locked transactions and multi-signature authorization, giving advanced users the control they want without sacrificing speed.
          </p>
          <p>
            With automatic backup options and encrypted cloud recovery, you can restore access quickly if you switch devices. This platform is built to help you manage large portfolios, recurring transfers, and international payments with confidence.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Enterprise-grade convenience</h2>
          <p>
            The Secure Digital Wallet supports real-time notifications, address whitelisting, and smart spending limits. Businesses can authorize payments with multi-user approval flows, while creators can securely store funds and approve payouts in a single interface.
          </p>
          <p>
            In addition to end-to-end encryption, our wallet uses continuous fraud detection and adaptive risk scoring. Suspicious activity triggers alerts instantly, so you stay ahead of threats and take action before any damage occurs.
          </p>
        </section>
      </div>
    ),
  },
  {
    slug: "community-governance",
    title: "Community Governance",
    icon: FaUsers,
    fullDescription: (
      <div className="space-y-8">
        <section className="space-y-6">
          <p>
            Ratel Coin isn't controlled by a centralized entity — it belongs to the people who use it. Our governance platform empowers every token holder to contribute proposals, vote on upgrades, and shape the rules that define the ecosystem.
          </p>
          <p>
            Decisions are made transparently on-chain, so you can see exactly how funds are allocated, how features are prioritized, and how community initiatives progress. This level of participation builds trust and creates a stronger network.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">How it works</h2>
          <p>
            Each member earns voting power through activity, staking, and contributions. Governance proposals cover everything from security updates to marketing budgets, new product integrations, and ecosystem partnerships.
          </p>
          <p>
            Our platform also includes delegation tools, so community members can trust experienced stakeholders to vote on their behalf without losing influence. It is designed to scale with the network while keeping governance accessible and meaningful.
          </p>
          <p>
            Over time, this model helps the ecosystem adapt faster, reward active participants, and maintain alignment between developers, users, and partners.
          </p>
        </section>
      </div>
    ),
  }
];

export default async function FeatureDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: { from?: string | string[] };
}) {
  // 👇 3. Await the params to unwrap the Promise
  const { slug } = await params;

  const feature = featuresData.find((f) => f.slug === slug);
  if (!feature) {
    notFound();
  }

  const from = Array.isArray(searchParams.from) ? searchParams.from[0] : searchParams.from;
  const backHref = from === "home" ? `/#${slug}` : "/features";
  const Icon = feature.icon;

  return (
    <div className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href={backHref}
          className="inline-flex items-center text-red-600 font-semibold hover:underline mb-8 transition"
        >
          ← Back to {from === "home" ? "Your Feature" : "All Features"}
        </Link>

        {/* Header */}
        <div className="flex items-center gap-6 mb-10">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-red-300 bg-red-50 text-red-600">
            <Icon className="text-6xl" />
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900">{feature.title}</h1>
        </div>

        {/* Unique Long Description */}
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed border-t pt-8">
          {feature.fullDescription}
        </div>
      </div>
    </div>
  );
}