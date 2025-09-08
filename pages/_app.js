import '../styles.css'
import Head from 'next/head'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <title>AI Figure Generator</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}
