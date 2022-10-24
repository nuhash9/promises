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

      <main className="max-w-screen-md mx-auto">
        <h1 className="text-4xl text-center font-serif font-bold p-2 my-8">
          Promises
        </h1>

        <div className="w-full text-xl text-center p-8 bg-white drop-shadow mt-4 h-['80vh']">
          <form className="leading-10 flex flex-col gap-2 items-center">
            <span>User promises <input className="outline-none text-center border-b-2 border-b-yellow-200" placeholder="search user" /> that</span>
            <input className="outline-none text-center w-4/5 border-b-2 border-b-yellow-200 mb-4" type="text" placeholder="what's the promise?" />
            <br /><button className="border border-green-200 p-2 bg-green-100 mt-4 text-base">Create a new promise</button>
          </form>
        </div>

      </main>
    </div>
  )
}

export default Home
