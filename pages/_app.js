import "../styles/globals.css";
import NextUIProvider from '@nextui-org/react/NextUIProvider'
import Header from "../components/Header";
// import { GoogleAnalytics } from '@next/third-parties/google'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <NextUIProvider>
        <Header />
        <Component {...pageProps} />
      </NextUIProvider>
    </>
  );
}

export default MyApp;