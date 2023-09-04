import {Footer} from '@/components/Footer';
import { Globe } from '@/components/Globe';
import {Hero} from '@/components/Hero';
import {MainHeader} from '@/components/MainHeader';
import {MainLogo} from '@/components/MainLogo';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Pinecast</title>
        <meta
          name="description"
          content="Kick-ass podcast hosting for the 21st century"
        />
      </Head>
      <MainLogo />
      <MainHeader />
      <Hero />
      <Globe />
      <Footer />
    </>
  );
}
