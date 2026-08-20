import InfoPage from "../components/InfoPage";

export default function CareersPage() {
  return (
    <InfoPage
      title="Careers"
      description="Explore open roles and join the Ratel Coin team as we build a next-generation digital economy."
    >
      <p className="text-gray-600 leading-8">
        We’re looking for talented people in engineering, design, product, marketing,
        and operations who want to make a meaningful impact in the blockchain and
        fintech ecosystem.
      </p>
      <p className="text-gray-600 leading-8">
        If you’re passionate about secure payments, smart user experiences, and
        scaling global technology platforms, Ratel Coin is the place to grow.
      </p>
    </InfoPage>
  );
}
