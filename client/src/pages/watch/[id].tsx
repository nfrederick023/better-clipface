/* eslint-disable @typescript-eslint/ban-ts-comment */
/*
 * Watch page - this is where the video is displayed
 */

import * as mime from "mime-types";

import { AuthStatus, Clip, LinkTypes, NextRedirect, Props, PropsWithAuth } from "../../utils/types";
import { redirectTo404, redirectToLogin } from "../../utils/redirects";
import React, { FC, MutableRefObject, useEffect, useRef, useState } from "react";

import { NextPageContext } from "next";
import { booleanify } from "../../utils/utils";
import { getAuthStatus } from "../../utils/auth";
import { getClipList } from "../../utils/storage";
import { useCookies } from "react-cookie";
import { useRouter } from "next/router";
import Container from "../../components/Container";
import CopyClipLink from "../../components/CopyLink";
import Head from "next/head";
import ReactMarkdown from "react-markdown";
import TimeAgo from "react-timeago";
import getConfig from "next/config";
import prettyBytes from "pretty-bytes";
import styled from "styled-components";

const { publicRuntimeConfig } = getConfig();

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: end;
  align-items: center;
  gap: 5px;
  padding-bottom: 10px;
  
  .is-info{
    background-color: #3273dc !important;
  }
`;

const BackLink = styled.a`
  display: inline-block;
  margin-right: auto;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const SingleClipAuthNotice = styled.p`
  margin-right: auto;
  opacity: 0.5;
`;

const InlineIcon = styled.i`
  position: relative;
  top: 1px;
  margin-right: 5px;
`;

// The height of the video container when in theatre mode
const videoContainerTheatreHeight = "calc(100vh - 136px - 150px)";

const VideoContainer = styled(Container).attrs({ noPadding: true })`
  &.theater-mode {
    background-color: black;
    position: absolute;
    left: 0px;
    right: 0px;
    max-width: initial;
    margin: 0px;
    height: ${videoContainerTheatreHeight};

    & video {
      width: 100%;
      height: 100%;
    }
  }
`;

// Spacer to push the contents behind the video container down
const VideoSpacer = styled.div`
  height: ${videoContainerTheatreHeight};
`;

const VideoInfo = styled.div`
  margin-top: 25px;
  padding-bottom: 50px;
`;

const VideoDescription = styled.div`
  margin-top: 25px;
`;


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StyledMeta = styled.meta`` as any;

interface WatchPageProps extends PropsWithAuth {
  selectedClip: Clip;
  mimeType: string | false;
  currentURL: string;
}

const WatchPage: FC<WatchPageProps> = ({ ...props }) => {
  const router = useRouter();
  const videoRef = useRef() as MutableRefObject<HTMLVideoElement>;
  const [cookies, setCookie] = useCookies(["theaterMode", "videoVolume"]);
  const [clip, setClip] = useState(props.selectedClip);
  const clipTitle = clip?.name.split(".").slice(0, -1).join(".");

  // The video volume can't be set directly on the element for some reason, so
  // we set it immediately after rendering

  useEffect(() => {
    if (clip) {
      document.title = clipTitle + " - " + publicRuntimeConfig.pageTitle;
    }
    if (videoRef.current) {
      videoRef.current.volume = parseFloat(cookies.videoVolume);
    }
  }, [clip]);

  const handleBackClick = (): void => {
    videoRef.current.pause();
    router.push("/");
  };

  const videoSrc = "/api/watch/" + encodeURIComponent(clip.id) + ".mp4";
  const thumbSrc = "/api/thumb/" + encodeURIComponent(clip.id);
  const currentURL = new URL(props.currentURL);
  const src = `${currentURL.protocol}//${currentURL.host}`;
  const fullVideoURL = `${src}${videoSrc}`;
  const fullThumbSrc = `${src}${thumbSrc}`;

  const handleVolumeChange = (): void => {
    let volume: number;
    if (videoRef.current.muted || videoRef.current.volume === 0) {
      volume = 0;
    } else {
      volume = videoRef.current.volume;
    }
    setCookie("videoVolume", volume, { path: "/" });
  };

  const toggleTheaterMode = (): void => {
    setCookie("theaterMode", !booleanify(cookies.theaterMode), { path: "/" });
  };

  const videoProps = {
    id: "video",
    src: videoSrc,
    controls: true,
    autoPlay: true,
    onVolumeChange: handleVolumeChange,
    style: { outline: "none" },
    ref: videoRef,
  };

  return (
    <>
      <>
        <Head>
          <title>{clipTitle + " - " + publicRuntimeConfig.pageTitle}</title>
          <StyledMeta property="og:type" value="video.other" />
          <StyledMeta property="og:site_name" value={publicRuntimeConfig.pageTitle} />
          <StyledMeta property="og:url" value={currentURL} />
          <StyledMeta property="og:title" value={props.selectedClip.name} />
          <StyledMeta property="og:image" content={fullThumbSrc} />
          <StyledMeta property="og:image:secure_url" content={fullThumbSrc} />
          <StyledMeta property="og:image:type" content="image/jpeg" />
          <StyledMeta property="og:image:width" content="1280" />
          <StyledMeta property="og:image:height" content="720" />
          <StyledMeta property="og:description" value="na" />
          <StyledMeta property="og:video" value={fullVideoURL} />
          <StyledMeta property="og:video:url" value={fullVideoURL} />
          <StyledMeta property="og:video:secure_url" value={fullVideoURL} />
          <StyledMeta property="og:video:type" content={props.mimeType.toString()} />
          <StyledMeta property="og:video:width" content="1280" />
          <StyledMeta property="og:video:height" content="720" />
          <StyledMeta name="twitter:card" content="player" />
          <StyledMeta name="twitter:site" content="@streamable" />
          <StyledMeta name="twitter:image" content={fullThumbSrc} />
          <StyledMeta name="twitter:player:width" content="1280" />
          <StyledMeta name="twitter:player:height" content="720" />
          <StyledMeta name="twitter:player" content={currentURL} />
        </Head >
      </>

      <Container>
        <ButtonRow>
          {/* Only show "Back to clips" button to authenticated users */}
          {props.authStatus === AuthStatus.authenticated && (
            <BackLink onClick={handleBackClick}>
              <span className="icon">
                <i className="fas fa-arrow-alt-circle-left"></i>
              </span>
              Back to clips
            </BackLink>
          )}

          {props.authStatus === AuthStatus.notAuthenticated && (
            <SingleClipAuthNotice>
              <InlineIcon className="fas fa-info-circle" />
              You are using a public link for this clip
            </SingleClipAuthNotice>
          )}

          <button
            className={"button is-small " + (booleanify(cookies.theaterMode) ? "is-info" : "")}
            onClick={toggleTheaterMode}
          >
            <span className="icon is-small">
              <i className="fas fa-film"></i>
            </span>
            <span>Theater mode</span>
          </button>
          {/* Only show link copying buttons to authenticated users */}
          {props.authStatus === AuthStatus.authenticated && (
            <>
              <CopyClipLink clip={clip} noText={true} linkType={LinkTypes.copyLink} />
              {clip.requireAuth ? <CopyClipLink clip={clip} noText={true} updateVideoList={setClip} linkType={LinkTypes.privateLink} /> :
                <CopyClipLink clip={clip} noText={true} updateVideoList={setClip} linkType={LinkTypes.publicLink} />
              }
              {clip.isFavorite ? <CopyClipLink clip={clip} noText={true} updateVideoList={setClip} linkType={LinkTypes.favoriteLink} /> :
                <CopyClipLink clip={clip} noText={true} updateVideoList={setClip} linkType={LinkTypes.unfavoriteLink} />
              }

            </>
          )}
        </ButtonRow>
      </Container>

      <>
        <VideoContainer className={booleanify(cookies.theaterMode) ? "theater-mode" : ""} noPadding={false}>
          <video {...videoProps} />
        </VideoContainer>

        {booleanify(cookies.theaterMode) && <VideoSpacer />}
      </>

      <Container>
        <VideoInfo>
          <h1 className="title is-4">{clipTitle}</h1>
          <h2 className="subtitle is-6">
            Uploaded <TimeAgo date={clip.saved} />
            <span style={{ margin: "0px 10px" }}>•</span>
            {prettyBytes(clip.size)}
          </h2>

          {clip.title && <em>Filename: {clip.name}</em>}

          <hr />

          {clip.description && (
            <VideoDescription className="content">
              <ReactMarkdown>{clip.description}</ReactMarkdown>
            </VideoDescription>
          )}
        </VideoInfo>
      </Container>
    </>
  );
};

export const getServerSideProps = async (ctx: NextPageContext): Promise<Props<WatchPageProps> | NextRedirect> => {
  const clipId: string = ctx.query.id as string;
  const state = await getClipList();
  const selectedClip = state.find((clip: Clip) => { return clip.id === clipId; });
  const authStatus = await getAuthStatus(ctx);
  //@ts-ignore
  const protocol = ctx.req?.headers?.["x-forwarded-proto"] || "http";
  //@ts-ignore
  const hostname = ctx.req?.headers?.["x-forwarded-host"] || ctx.req?.headers["host"];
  //@ts-ignore
  const currentURL = new URL(ctx.req?.url, `${protocol}://${hostname}`).toString();

  // if no clip was found return null
  if (!selectedClip) {
    return redirectTo404();
  }

  const mimeType = mime.lookup(selectedClip.name);
  // if clip requires auth, check auth status
  if (selectedClip.requireAuth) {
    if (authStatus === AuthStatus.authenticated)
      return { props: { selectedClip, currentURL, authStatus, mimeType } };
    else
      return redirectToLogin(ctx);
  }

  // if no auth required
  return { props: { selectedClip, currentURL, authStatus, mimeType } };
};

export default WatchPage;
