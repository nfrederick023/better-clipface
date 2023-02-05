import { AuthStatus, PropsWithAuth } from "../constants/interfaces";
import { NextPageContext, Redirect } from "next";

import { Request } from "express";
import config from "config";
import isAuthorized from "./auth";

/**
 * Wrapper around getServerSideProps to enforce authentication
 *
 * This handles regular user authentication as well as single page
 * authentication.
 *
 * @param {function} fn The original getServerSideProps function
 * @returns {function} The getServerSideProps function with authentication
 */
export default function (fn: any) {
  return async (ctx: NextPageContext): Promise<{ props: PropsWithAuth } | { redirect: Redirect }> => {
    const urlToRedirect = ctx.req?.url ? "/login?next=" + encodeURIComponent(ctx.req.url ? ctx.req.url : "") : "/login";
    const redirect: Redirect = {
      destination: urlToRedirect,
      permanent: false,
    };
    const props: { props: PropsWithAuth } = await fn(ctx);

    const authenticated = await isAuthorized(ctx.req as Request);

    if (!authenticated && ctx.req?.url !== "/login") {
      //@ts-ignore
      if (props.props?.selectedClip?.requireAuth === undefined)
        return { redirect };

      //@ts-ignore
      if (props.props?.selectedClip?.requireAuth)
        return { redirect };
    }

    if (props.props) {
      let authStatus: AuthStatus;

      if (config.has("user_password") || authenticated) {
        authStatus = AuthStatus.authenticated;
      } else {
        authStatus = AuthStatus.notAuthenticated;
      }

      props.props.authStatus = authStatus;
    }
    return props;
  };
}
