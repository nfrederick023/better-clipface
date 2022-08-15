/*
 * Custom app component, used to redirect if authentication is missing
 */
import { createGlobalStyle } from "styled-components";
const { publicRuntimeConfig } = getConfig();
import { Cookies, CookiesProvider } from "react-cookie";
import App from "next/app";
import getConfig from "next/config";
import "react-toggle/style.css";

const GlobalStyle = createGlobalStyle`
  html {
    font-family: "Montserrat", sans-serif;
  }

  body {
    position: relative;
    font-family: inherit;
    min-height: 100vh;
    box-sizing: border-box;
    padding-bottom: 33px;
  }

  .react-toggle {
   right: 10px;
  }
  .react-toggle--checked:hover .react-toggle-track {
    background-color: #3273dc !important;
  }

  .react-toggle--checked .react-toggle-track {
    background-color: #3273dc !important;
  }

  .react-toggle-thumb {
    box-shadow: 0px 0px 0px 0px #3273dc !important;
  }
`;

function MyApp({ Component, pageProps, allCookies }) {
  const cookies = new Cookies(allCookies);

  const setCookies = (name, value) => {
    cookies.set(name, value, { path: '/', sameSite: 'strict', expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) });
  }
  if (typeof allCookies?.theaterMode == 'undefined') setCookies("theaterMode", false);
  if (typeof allCookies?.videoVolume == 'undefined') setCookies("videoVolume", 1);
  if (typeof allCookies?.clipsPerPage == 'undefined') setCookies("clipsPerPage", 40);
  if (typeof allCookies?.isDarkMode == 'undefined') setCookies("isDarkMode", true);
  if (typeof allCookies?.authToken == 'undefined') setCookies("authToken", "");

  return (
    <>
      <title>{publicRuntimeConfig.pageTitle}</title>
      <GlobalStyle />
      <CookiesProvider cookies={cookies}>
        <Component {...pageProps} />
      </CookiesProvider>
    </>
  );
}

MyApp.getInitialProps = async (ctx) => {
  const appProps = await App.getInitialProps(ctx);
  return { ...appProps, allCookies: ctx.ctx.req?.cookies };
};

export default MyApp;
