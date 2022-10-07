import { FC, useEffect, useState } from "react";
import Container from "./Container";
import { Helmet } from "react-helmet";
import { LayoutProps } from "../shared/interfaces";
import Toggle from "react-toggle";
import getConfig from "next/config";
import styled from "styled-components";
import { useCookies } from "react-cookie";
import { useRouter } from "next/router";
import { booleanify } from "../shared/functions";

const { publicRuntimeConfig } = getConfig();

const Header = styled.header`
  background-size: 1920px auto;
  background-position: center center;
  background-repeat: no-repeat;
`;

const NavbarContainer = styled(Container as any)`
  min-height: 3.25rem;
  display: flex;
  align-items: center;
  width: 100%;
`;

const NavbarMenu = styled.div`
  flex: 1;
  display: flex;
  justify-content: end;
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

const ClipfaceLayout: FC<LayoutProps> = ({children}) => {
  const router = useRouter();
  const [cookies, setCookies] = useCookies(['isDarkMode', 'authToken']);

  const onSignOut = (): void => {
    setCookies("authToken", '', { path: "/" });
    router.push("/login");
  };

  const toggleDarkMode = (): void => {
    setCookies("isDarkMode", !booleanify(cookies.isDarkMode), { path: "/" });
  }

  return (
    <>
      {booleanify(cookies.isDarkMode) ? (
        <Helmet>
          <link rel="stylesheet"
            href="https://unpkg.com/bulma-dark-variant@0.1.2/css/bulma-prefers-dark.css"
            integrity=
            "sha384-+O4suC4e+wPpI+J/CjVVRBa0Ucczt7woYuvUIGGns36h/5cvowumaIQMDZBbu0Tz"
            crossOrigin="anonymous"
          />
        </Helmet>
      ) : (
        <Helmet></Helmet>
      )}
      <section className="hero is-dark">
        <Header className="hero-head">
          <nav>
            <NavbarContainer>
              <a href="/">
                <HeaderTitle className="title is-4">
                  {publicRuntimeConfig.headerTitle}
                </HeaderTitle>
              </a>
              <NavbarMenu>
                <Toggle
                  icons={false}
                  checked={booleanify(cookies.isDarkMode)}
                  onChange={toggleDarkMode} />
                {cookies.authToken && (
                  <a onClick={onSignOut}>
                    Log out
                  </a>
                )}
              </NavbarMenu>
            </NavbarContainer>
          </nav>
        </Header>
      </section>

      <ApplicationDiv>
        {children}
      </ApplicationDiv>

      <Footer>
        <div className="container">
          Snacks
        </div>
      </Footer>
    </>
  );
}

export default ClipfaceLayout;
