import InfoPage from "../components/InfoPage";

export default function WhitepaperPage() {
  return (
    <InfoPage
      title="Whitepaper"
      description="Read the Ratel Coin whitepaper to understand our protocol, token economics, and technical roadmap."
    >
      <p className="text-gray-600 leading-8">
        The whitepaper outlines our vision for a secure, scalable ecosystem where
        digital payments, marketplace services, and community governance come together.
      </p>
      <p className="text-gray-600 leading-8">
        Download the full document to explore our architecture, token model, and the
        milestones we are building toward.
      </p>
    </InfoPage>
  );
}
