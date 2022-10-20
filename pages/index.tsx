import type { NextPage } from 'next'
import Head from 'next/head'

const Home: NextPage = () => {
  return (
    <div className="">
      <Head>
        <title>Promises</title>
        <meta name="description" content="Keep track of given word" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="">
        <h1 className="text-3xl text-cyan-800">
          Promises
        </h1>

      </main>
    </div>
  )
}

export default Home
