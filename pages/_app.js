import "../styles/globals.css";
import Navbar from "../components/Navbar"
import { NextUIProvider } from '@nextui-org/react'
import Header from "../components/Header";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <NextUIProvider>
        {/* <Navbar /> */}
        <Header />
        <Component {...pageProps} />
      </NextUIProvider>
    </>
  );
}

export default MyApp;