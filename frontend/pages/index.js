import Head from 'next/head';
import RecipeSocialLanding from '../components/landing/recipe-social-landing';

export default function Home() {
  return (
    <>
      <Head>
        <title>Recipedium | Share Your Culinary Journey</title>
        <meta name="description" content="Recipedium - A platform for sharing and discovering recipes from around the world" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <RecipeSocialLanding />
    </>
  );
} 