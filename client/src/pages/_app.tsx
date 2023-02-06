/*
 * Custom app component, used to redirect if authentication is missing
 */

import "react-toggle/style.css";

import { Cookies, CookiesProvider } from "react-cookie";
import { NextPage, NextPageContext } from "next";
import { ReactElement, useState } from "react";

import { AppContext } from "next/app";
import { Request } from "express";
import { createGlobalStyle } from "styled-components";
import ClipfaceLayout from "../components/Layout";
import React from "react";
import config from "config";
import getConfig from "next/config";

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

interface MyAppProps {
  allCookies: { [key: string]: string | boolean | number },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component?: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pageProps?: any
}

const MyApp: NextPage<MyAppProps> = ({ ...props }: MyAppProps): ReactElement => {
  const cookies = new Cookies(props.allCookies);

  const [currentPage, setCurrentPage] = useState(0);

  const setCookies = (name: string, value: string | boolean | number): void => {
    cookies.set(name, value, { path: "/", sameSite: "strict", expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) });
  };
  if (typeof props.allCookies?.theaterMode === "undefined") setCookies("theaterMode", false);
  if (typeof props.allCookies?.videoVolume === "undefined") setCookies("videoVolume", 1);
  if (typeof props.allCookies?.clipsPerPage === "undefined") setCookies("clipsPerPage", 40);
  if (typeof props.allCookies?.isDarkMode === "undefined") setCookies("isDarkMode", true);
  if (typeof props.allCookies?.authToken === "undefined") setCookies("authToken", "");
  return (
    <>
      <title>{publicRuntimeConfig.pageTitle}</title>
      <GlobalStyle />
      <CookiesProvider cookies={cookies}>
        <ClipfaceLayout hasAuth={publicRuntimeConfig.hasPassword}>
          <props.Component {...props.pageProps} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </ClipfaceLayout>
      </CookiesProvider>
    </>
  );
};

MyApp.getInitialProps = async (ctx: NextPageContext): Promise<MyAppProps> => {
  const context = ctx as unknown as AppContext;
  const request = context.ctx.req as Request;
  return { allCookies: request.cookies };
};

export default MyApp;
