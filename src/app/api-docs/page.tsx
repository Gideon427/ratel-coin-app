import InfoPage from "../components/InfoPage";

export default function ApiDocsPage() {
  return (
    <InfoPage
      title="API Documentation"
      description="Browse the Ratel Coin API reference, endpoints, and examples for developers."
    >
      <p className="text-gray-600 leading-8">
        The Ratel Coin API lets you integrate wallet operations, transactions,
        and ecosystem services into your apps. Explore endpoints for authentication,
        balance lookups, transfers, and more.
      </p>
      <p className="text-gray-600 leading-8">
        Use this page as the starting point for building secure and scalable
        integrations with the Ratel Coin platform.
      </p>
    </InfoPage>
  );
}
