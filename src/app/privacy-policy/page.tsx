import InfoPage from "../components/InfoPage";

export default function PrivacyPolicyPage() {
  return (
    <InfoPage
      title="Privacy Policy"
      description="Read how Ratel Coin collects, uses, and protects your personal data."
    >
      <p className="text-gray-600 leading-8">
        We prioritize your privacy and handle personal information with care.
        This policy explains the data we collect, why we collect it, and how it is used.
      </p>
      <p className="text-gray-600 leading-8">
        For details about cookies, security, and your rights, review the full
        privacy policy on this page.
      </p>
    </InfoPage>
  );
}
