/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */

import { GetServerSideProps } from "next";
import { IncomingMessage } from "http";
import { ReactNode } from "react";

export interface Clip {
    clipName: string;
    name: string,
    size: number,
    saved: number,
    created: number,
    title: string | null,
    description: string | null,
    requireAuth: boolean,
    isFavorite: boolean,
    id: string,
    mime?: string
}

export interface MetaData {
    title: string | null,
    description: string | null,
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
    children?: ReactNode,
    authStatus?: AuthStatus,
    pageName: string
}

export interface CopyLinkProps {
    updateVideoList?: (clip: Clip) => void,
    clip: Clip,
    noText: boolean,
    linkType: LinkTypes
}

export interface PropsWithAuth extends GetServerSideProps {
    authStatus?: string
}

export interface IncomingMessageCookies extends IncomingMessage {
    cookies: { [key: string]: string | boolean | number };
}

export interface PaginationProps {
    totalPages: number,
    currentPage: number,
    clipsPerPage: number | string,
    totalClips: number,
    showLabel: boolean,
    onChangePage: (newPageNumber: number) => void,
    onChangeClipsPerPage: (newClipsPerPage: number) => void
}

export interface MyAppProps {
    allCookies: { [key: string]: string | boolean | number },
    Component?: any,
    pageProps?: any
}

export interface ClipMeta {
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

export interface AuthStatus { authStatus?: string }

export interface WatchPageProps {
    authStatus: AuthStatus,
    selectedClip: Clip
}

export interface IndexPageProps {

    allClips: Clip[],
    pagination: boolean,
    authStatus: AuthStatus

}
