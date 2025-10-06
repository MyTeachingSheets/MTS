import '../styles/globals.css'
import '/public/style.css'
import Header from '../components/Header'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
    </>
  )
}
