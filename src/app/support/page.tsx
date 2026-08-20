import InfoPage from "../components/InfoPage";

export default function SupportPage() {
  return (
    <InfoPage
      title="Support"
      description="Get help with your Ratel Coin account, wallet access, and platform questions."
    >
      <p className="text-gray-600 leading-8">
        Our support team is ready to assist with account issues, transaction questions,
        and general platform guidance.
      </p>
      <p className="text-gray-600 leading-8">
        Browse help topics, contact support, or find answers to common questions about
        using Ratel Coin safely and effectively.
      </p>
    </InfoPage>
  );
}
