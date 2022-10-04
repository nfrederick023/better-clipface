/* Convenience wrapper for getServerSideProps to enforce authentication */

import { NextPageContext, Redirect } from "next";

import { PropsWithAuth } from "../shared/interfaces";
import { Request } from "express";
import config from "config";
import isAuthorized from "./auth";

/**
 * Wrapper around getServerSideProps to enforce authentication
 *
 * This handles regular user authentication as well as single page
 * authentication.
 *
 * @param {function} fn
 * @returns {function}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function (fn: any) {
  return async (ctx: NextPageContext): Promise<{ props: PropsWithAuth } | { redirect: Redirect }> => {

    const urlToRedirect = ctx.req?.url ? "/login?next=" + encodeURIComponent(ctx.req.url ? ctx.req.url : "") : "/login";
    const redirect: Redirect = {
      destination: urlToRedirect,
      permanent: false,
    }
    const props: { props: PropsWithAuth } = await fn(ctx);

    const authenticated = await isAuthorized(ctx.req as Request);

    if (!authenticated && ctx.req?.url != "/login" && !ctx.req?.url?.includes("/watch")) {
      return { redirect };
    }

    if (props.props) {
      let authStatus;

      if (!config.has("user_password") || !authenticated) {
        authStatus = "NO_AUTHENTICATION";
      } else {
        authStatus = "AUTHENTICATED";
      }

      props.props.authStatus = authStatus;
    }
    return props;
  };
}
