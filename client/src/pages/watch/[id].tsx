/*
 * Watch page - this is where the video is displayed
 */

import { Clip, LinkTypes, WatchPageProps } from "../../shared/interfaces";
import { FC, MutableRefObject, useEffect, useRef, useState } from "react";
import { NextPageContext, Redirect } from "next";

import ClipfaceLayout from "../../components/Layout";
import Container from "../../components/Container";
import CopyClipLink from "../../components/CopyLink";
import Head from "next/head";
import ReactMarkdown from "react-markdown";
import TimeAgo from "react-timeago";
import config from "config";
import fse from "fs-extra";
import getConfig from "next/config";
import path from "path";
import prettyBytes from "pretty-bytes";
import requireAuth from "../../backend/requireAuth";
import styled from "styled-components";
import { useCookies } from "react-cookie";
import { useRouter } from "next/router";

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

const WatchPage: FC<WatchPageProps> = ({ authStatus, selectedClip }) => {
  const router = useRouter();
  const videoRef = useRef() as MutableRefObject<HTMLVideoElement>;
  const [cookies, setCookie] = useCookies(["theaterMode", "videoVolume"]);
  const [theaterMode, setTheaterMode] = useState(cookies.theaterMode === "true");
  const [videoVolume, setVideoVolume] = useState(parseFloat(cookies.videoVolume))
  const [clip, setClip] = useState(selectedClip);
  const [currentURL, setCurrentURL] = useState("");
  const [fullVideoURL, setFullVideoURL] = useState("");
  const clipTitle = clip.name.split(".").slice(0, -1).join(".");

  // The video volume can't be set directly on the element for some reason, so
  // we set it immediately after rendering
  useEffect(() => {
    const url = new URL(window.location.href)
    setCurrentURL(window.location.href);
    setFullVideoURL(`${url.protocol}//${url.host}${videoSrc}`);
    if (clip) {
      document.title = clipTitle + " - " + publicRuntimeConfig.pageTitle;
    }
    videoRef.current.volume = videoVolume
  }, [clip]);



  if (!clip) {
    return <div>404 Clip Not Found</div>;
  }

  const handleBackClick = (): void => {
    videoRef.current.pause();
    router.push("/");
  };

  const videoSrc = "/api/video/" + encodeURIComponent(clip.id);

  const handleVolumeChange = (): void => {

    let volume: number;
    if (videoRef.current.muted || videoRef.current.volume === 0) {
      volume = 0;
    } else {
      volume = videoRef.current.volume;
    }
    setCookie("videoVolume", volume, { path: "/" });
    setVideoVolume(volume)
  };

  const toggleTheaterMode = (): void => {
    setCookie("theaterMode", !theaterMode, { path: "/" });
    setTheaterMode(!theaterMode);
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
          <meta property="og:type" data-value="video.other" />
          <meta property="og:site_name" data-value={publicRuntimeConfig.pageTitle} />
          <meta property="og:title" data-value={clipTitle} />
          <meta property="og:url" data-value={currentURL} />
          {
            clip.description && (
              <meta property="og:description" data-value={clip.description} />
            )
          }
          <meta property="og:video" data-value={fullVideoURL} />
          <meta property="og:video:url" data-value={fullVideoURL} />
          <meta property="og:video:secure_url" data-value={fullVideoURL} />
          <meta property="og:video:type" content={clip.mime} />
          <meta property="og:video:width" content="1280" />
          <meta property="og:video:height" content="720" />
        </Head >
      </>
      <ClipfaceLayout authStatus={authStatus} pageName="watch">
        <Container>
          <ButtonRow>
            {/* Only show "Back to clips" button to authenticated users */}
            {authStatus == "AUTHENTICATED" && (
              <BackLink onClick={handleBackClick}>
                <span className="icon">
                  <i className="fas fa-arrow-alt-circle-left"></i>
                </span>
                Back to clips
              </BackLink>
            )}

            {authStatus == "SINGLE_PAGE_AUTHENTICATED" && (
              <SingleClipAuthNotice>
                <InlineIcon className="fas fa-info-circle" />
                You are using a public link for this clip
              </SingleClipAuthNotice>
            )}

            <button
              className={"button is-small " + (theaterMode ? "is-info" : "")}
              onClick={toggleTheaterMode}
            >
              <span className="icon is-small">
                <i className="fas fa-film"></i>
              </span>
              <span>Theater mode</span>
            </button>
            {/* Only show link copying buttons to authenticated users */}
            {authStatus == "AUTHENTICATED" && (
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
          <VideoContainer className={theaterMode ? "theater-mode" : ""} noPadding={false}>
            <video {...videoProps}><div> lalalalala</div> </video>
          </VideoContainer>

          {theaterMode && <VideoSpacer />}
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
      </ClipfaceLayout>
    </>
  );
};

export const getServerSideProps = requireAuth(async (ctx: NextPageContext) => {
  const CLIPS_PATH: string = config.get("clips_path");

  const clipId: string = ctx.query.id as string;
  const state = await fse.readJSON(path.join(CLIPS_PATH, "/assets/state.json"));
  const selectedClip = state.find((clip: Clip) => { return clip.id == clipId });

  if (selectedClip?.requireAuth) {
    const redirect: Redirect = {
      destination: "/login?next=" + encodeURIComponent(ctx?.req?.url ? ctx?.req?.url : ""),
      permanent: false,
    }
    return { redirect };
  }
  return {
    props: { selectedClip },
  };
});

export default WatchPage;
