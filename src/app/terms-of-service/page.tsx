import InfoPage from "../components/InfoPage";

export default function TermsOfServicePage() {
  return (
    <InfoPage
      title="Terms of Service"
      description="Review the rules and conditions for using the Ratel Coin platform."
    >
      <p className="text-gray-600 leading-8">
        These terms define your rights and responsibilities while using Ratel Coin.
        Please read them carefully before accessing our services.
      </p>
      <p className="text-gray-600 leading-8">
        The terms cover account usage, transaction policies, and platform governance.
      </p>
    </InfoPage>
  );
}
