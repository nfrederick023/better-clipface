/*
 * The base layout of the application
 */

import React, { useEffect } from 'react';
import { useRouter } from "next/router";
import { Helmet } from "react-helmet";
import Toggle from "react-toggle";
import useLocalSettings from "../localSettings";
import styled from "styled-components";
import getConfig from "next/config";
import Container from "./Container";
import "react-toggle/style.css";

const { publicRuntimeConfig } = getConfig();

const Header = styled.header`
  background-size: 1920px auto;
  background-position: center center;
  background-repeat: no-repeat;
`;

const NavbarContainer = styled(Container)`
  min-height: 3.25rem;
  display: flex;
  align-items: center;
  width: 100%;
`;

const NavbarMenu = styled.div`
  flex: 1;
  display: flex;
  justify-content: end;

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

const ApplicationDiv = styled.div`
  padding: 50px 0;
  position: static;

  @media (max-width: 1344px) {
    padding: 20px 0;
  }
`;

const Footer = styled.footer`
  position: absolute;
  right: 0px;
  bottom: 0px;
  left: 0px;
  height: 33px;

  display: flex;
  align-items: center;

  background-color: rgba(0, 0, 0, 0.07);
  color: rgba(0, 0, 0, 0.7);
  text-align: center;
  font-size: 0.8rem;

  i {
    position: relative;
    top: 1px;
    font-size: 1rem;
    margin-right: 2px;
  }

  a,
  a:hover,
  a:visited {
    padding: 6px;
    color: rgba(0, 0, 0, 0.75);
  }

  .dot {
    margin: 0px 4px;
  }
`;

const HeaderTitle = styled.h1`
  font-weight: 800;
  font-size: 1.5rem;
`;

export function ClipfaceLayout({
  children,
  authInfo = { status: "NOT_AUTHENTICATED" },
  pageName = null,
  pageTitle = null,
  pageSubtitle = null,
}) {
  const router = useRouter();
  const contentClassName = pageName ? `page-${pageName}` : "";
  const [localSettings, setLocalSettings] = useLocalSettings();

  useEffect(() => {
    document.title = publicRuntimeConfig.pageTitle;
  }, []);

  const toggleDarkMode = () => {
    setLocalSettings({
      ...localSettings,
      isDarkmode: !localSettings.isDarkmode,
    });
  };

  const onSignOut = () => {
    logout().then((ok) => {
      if (ok) {
        router.push("/login");
      } else {
        alert("Failed to log out, please check your network connection");
      }
    });
  };

  return (
    <>
      {localSettings.isDarkmode ? (
        <Helmet
          link={[
            {
              rel: "stylesheet",
              href: "https://unpkg.com/bulma-prefers-dark",
              integrity:
                "sha384-5kFoflEnYHUHkE+dDg8wj1wdx9k9JELPWJmnxlCwjl0mA7YdbfQfR0TQTsKrvQiW",
              crossOrigin: "anonymous",
            },
          ]}
        >
          <body style="background-color: #050505;"></body>
        </Helmet>
      ) : (
        <Helmet></Helmet>
      )}
      <section className="hero is-dark">
        <Header className="hero-head">
          <nav>
            <NavbarContainer>
              <a href="/">
                <HeaderTitle class="title is-4">
                  {publicRuntimeConfig.headerTitle}
                </HeaderTitle>
              </a>
              <NavbarMenu>
                <Toggle
                  icons={false}
                  checked={localSettings.isDarkmode}
                  onChange={toggleDarkMode}
                />
                {authInfo.status == "AUTHENTICATED" && (
                  <a onClick={onSignOut}>
                    Log out
                  </a>
                )}
              </NavbarMenu>
            </NavbarContainer>
          </nav>
        </Header>

        {pageTitle && (
          <div className="hero-body">
            <div className="container has-text-centered">
              <p className="title">{pageTitle}</p>

              {pageSubtitle && <p className="subtitle">{subtitle}</p>}
            </div>
          </div>
        )}
      </section>

      <ApplicationDiv className={contentClassName}>
        {children}
      </ApplicationDiv>

      <Footer>
        <div className="container">
          {/* <a href="https://github.com/Hubro/clipface" target="_blank">
            <i class="fab fa-github"></i> Clipface
          </a> */}
        </div>
      </Footer>
    </>
  );
}

export default ClipfaceLayout;

/**
 * Logs out through the API
 */
async function logout() {
  const response = await fetch("/api/logout", { method: "POST" });

  if (response.ok) {
    return true;
  }

  console.error("Failed to log out", response);
  return false;
}
