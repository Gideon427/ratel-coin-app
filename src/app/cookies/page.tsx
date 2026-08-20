import InfoPage from "../components/InfoPage";

export default function CookiesPage() {
  return (
    <InfoPage
      title="Cookies"
      description="Learn how Ratel Coin uses cookies and local storage to improve your experience."
    >
      <p className="text-gray-600 leading-8">
        Cookies help us remember your preferences, improve site performance, and
        deliver a better browsing experience.
      </p>
      <p className="text-gray-600 leading-8">
        This page explains the types of cookies we use and how you can manage them.
      </p>
    </InfoPage>
  );
}
