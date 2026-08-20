import InfoPage from "../components/InfoPage";

export default function DocumentationPage() {
  return (
    <InfoPage
      title="Documentation"
      description="Access guides, tutorials, and technical resources for integrating with the Ratel Coin ecosystem."
    >
      <p className="text-gray-600 leading-8">
        Our documentation covers wallet setup, payment flows, security best practices,
        and the developer tools you need to build on Ratel Coin.
      </p>
      <p className="text-gray-600 leading-8">
        Whether you’re a user, partner, or developer, this is the starting point for
        learning how to connect with our platform.
      </p>
    </InfoPage>
  );
}
