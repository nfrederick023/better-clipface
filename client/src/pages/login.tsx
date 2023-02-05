/*
 * Login page
 */

import { FC, MutableRefObject, useEffect, useRef, useState } from "react";
import { ParsedUrl, parseUrl } from "next/dist/shared/lib/router/utils/parse-url";

import { AuthResponse } from "../constants/interfaces";
import { Redirect } from "next/types";
import { useCookies } from "react-cookie";
import { useRouter } from "next/router";
import Container from "../components/Container";
import config from "config";
import styled from "styled-components";

const LoginBox = styled.div`
  margin: 0px auto;
  max-width: 500px;
  margin-top: 25vh;
`;

const Form = styled.form`
  margin-top: 25px;
`;

const LoginButton = styled.button`
  background-color: #3273dc !important;
  width: 100%;
  height: 48px;
`;

const LoginPage: FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [cookies, setCookie] = useCookies(["authToken"]);
  const passwordFieldRef = useRef() as MutableRefObject<HTMLInputElement>;

  useEffect(() => {
    passwordFieldRef.current.focus();
  });

  const next: ParsedUrl = "next" in router.query ? parseUrl(router.query["next"] as string) : parseUrl("/");

  const onPasswordChange = (password: string): void => {
    setPassword(password);
  };

  const onSubmit = (e: { preventDefault: () => void; }): void => {
    e.preventDefault();
    setIsLoading(true);
    login(password)
      .then((res) => {
        if (res?.authToken) {
          cookies.authToken;
          setCookie("authToken", res.authToken, { path: "/" });
          router.push(next);
        } else {
          setIsLoading(false);
          setError("Invalid user name or password, please try again");
        }
      })
      .catch(() => {
        setIsLoading(false);
        setError("Login failed due to an unexpected error");
      });
  };

  return (
      <Container>
        <LoginBox className="box">
          <p className="has-text-centered has-text-weight-bold">
            This page is password protected
          </p>

          <Form onSubmit={onSubmit}>
            <div className="field">
              <p className="control has-icons-left">
                {/* The username field is not used for anything but Chrome
                * complains if it's missing */}
                <input
                  name="username"
                  value="default"
                  autoComplete="username"
                  hidden={true}
                  readOnly={true}
                />

                <input
                  ref={passwordFieldRef}
                  className={"input" + (error ? " is-danger" : "")}
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={password}
                  onChange={(event): void => onPasswordChange(event.target.value)}
                />

                {error && <p className="has-text-danger">{error}</p>}

                <span className="icon is-small is-left">
                  <i className="fas fa-lock"></i>
                </span>
              </p>
            </div>
            <div className="field">
              <p className="control">
                <LoginButton className="button is-primary" disabled={isLoading}>
                  {isLoading && <i className="fa fa-cog fa-spin" />}
                  {!isLoading && "Login"}
                </LoginButton>
              </p>
            </div>
          </Form>
        </LoginBox>
      </Container>
  );
};

/**
 * Attempts to log in, yields true if login succeeds, false otherwise
 *
 * @param {string} password
 */
 export const login = async(password: string): Promise<AuthResponse | undefined> => {

  const response = await fetch("/api/login", {
    method: "POST",
    cache: "no-cache",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: encodeURIComponent(password) }),
  });

  if (response.ok) {
    return await response.json();
  }

  return undefined;
};

export const getServerSideProps = (): { redirect: Redirect } | { props: Record<string, never> } => {
  // If no user authentication is configured, forward to the index page
  if (!config.has("user_password")) {
    const redirect: Redirect = {
      destination: "/",
      permanent: false,
    };
    return { redirect };
  }
  return { props: {} };
};

export default LoginPage;
