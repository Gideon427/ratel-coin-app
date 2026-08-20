import InfoPage from "../components/InfoPage";

export default function BlogPage() {
  return (
    <InfoPage
      title="Blog"
      description="Read the latest updates, insights, and product news from the Ratel Coin team."
    >
      <p className="text-gray-600 leading-8">
        Stay up to date with announcements, feature launches, and stories from our
        community and product team.
      </p>
      <p className="text-gray-600 leading-8">
        The blog is your source for learning how Ratel Coin is evolving and what’s
        coming next in our ecosystem.
      </p>
    </InfoPage>
  );
}
