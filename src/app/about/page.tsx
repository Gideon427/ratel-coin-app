import InfoPage from "../components/InfoPage";

export default function AboutPage() {
  return (
    <InfoPage
      title="About Ratel Coin"
      description="Learn about our mission to build the world’s largest decentralized technology ecosystem powered by one digital currency."
    >
      <p className="text-gray-600 leading-8">
        Ratel Coin is designed to make payments fast, secure, and accessible for everyone.
        Our platform combines financial tools, digital products, and a global community into a
        single experience that supports innovation and everyday commerce.
      </p>
      <p className="text-gray-600 leading-8">
        We believe in transparent systems, user-first design, and the power of a
        distributed network to unlock new possibilities for creators, businesses, and
        developers alike.
      </p>
    </InfoPage>
  );
}
