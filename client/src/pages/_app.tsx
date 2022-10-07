/*
 * Custom app component, used to redirect if authentication is missing
 */

import "react-toggle/style.css";

import { Cookies, CookiesProvider } from "react-cookie";
import { NextPage, NextPageContext } from "next";

import { AppContext } from "next/app";
import { MyAppProps } from "../shared/interfaces";
import { ReactElement } from "react";
import { Request } from "express";
import { createGlobalStyle } from "styled-components";
import getConfig from "next/config";
import ClipfaceLayout from "../components/Layout";

const { publicRuntimeConfig } = getConfig();

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

const MyApp: NextPage<MyAppProps> = ({ Component, pageProps, allCookies }: MyAppProps): ReactElement => {
  const cookies = new Cookies(allCookies);

  const setCookies = (name: string, value: string | boolean | number): void => {
    cookies.set(name, value, { path: "/", sameSite: "strict", expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) });
  }
  if (typeof allCookies?.theaterMode == "undefined") setCookies("theaterMode", false);
  if (typeof allCookies?.videoVolume == "undefined") setCookies("videoVolume", 1);
  if (typeof allCookies?.clipsPerPage == "undefined") setCookies("clipsPerPage", 40);
  if (typeof allCookies?.isDarkMode == "undefined") setCookies("isDarkMode", true);
  if (typeof allCookies?.authToken == "undefined") setCookies("authToken", "");
  return (
    <>
      <title>{publicRuntimeConfig.pageTitle}</title>
      <GlobalStyle />
      <CookiesProvider cookies={cookies}>
      <ClipfaceLayout>
        <Component {...pageProps} />
      </ClipfaceLayout>
      </CookiesProvider>
    </>
  );
}

MyApp.getInitialProps = async (ctx: NextPageContext): Promise<MyAppProps> => {
  const context = ctx as unknown as AppContext;
  const request = context.ctx.req as Request;
  return { allCookies: request.cookies };
};

export default MyApp;
