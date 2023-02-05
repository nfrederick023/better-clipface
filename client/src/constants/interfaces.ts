/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */

import { GetServerSideProps } from "next";
import { IncomingMessage } from "http";
import { ReactNode } from "react";

export interface Video {
  name: string,
  size: number,
  saved: number,
  created: number,
  title: string,
  description: string,
  requireAuth: boolean,
  isFavorite: boolean,
  id: string,
  mime?: string
}

export interface MetaData {
  title: string,
  description: string,
}

export enum AuthStatus {
  authenticated,
  notAuthenticated
}

export enum LinkTypes {
  publicLink,
  privateLink,
  favoriteLink,
  unfavoriteLink,
  copyLink
}

export enum SortTypes {
  created = "created",
  saved = "saved",
  name = "name",
  size = "size"
}

export interface LayoutProps {
  children?: ReactNode
}

export interface CopyLinkProps {
  updateVideoList?: (clip: Video) => void,
  clip: Video,
  noText: boolean,
  linkType: LinkTypes
}

export interface PropsWithAuth extends GetServerSideProps {
  authStatus?: AuthStatus
}

export interface IncomingMessageCookies extends IncomingMessage {
  cookies: { [key: string]: string | boolean | number };
}

export interface MyAppProps {
  allCookies: { [key: string]: string | boolean | number },
  Component?: any,
  pageProps?: any
}

export interface VideoMeta {
  description: string,
  title: string,
  size: number,
  name: string,
  saved: string,
  mime: string
}

export interface AuthResponse extends Response {
  authToken: string
}

export interface WatchPageProps {
  authStatus: AuthStatus,
  selectedClip: Video | undefined
}

export interface IndexPageProps {
  allClips: Video[],
  pagination: boolean,
  authStatus: AuthStatus
}
