/*
 * Watch page - this is where the video is displayed
 */

import { useEffect, useRef, useState } from "react";

import ClipfaceLayout from "../../components/ClipfaceLayout";
import Container from "../../components/Container";
import CopyClipLink from "../../components/CopyClipLink";
import Head from "next/head";
import ReactMarkdown from "react-markdown";
import TimeAgo from "react-timeago";
import booleanify from "booleanify";
import config from "config";
import fse from 'fs-extra';
import getConfig from "next/config";
import getMeta from "../../backend/getMeta";
import path from "path";
import prettyBytes from "pretty-bytes";
import requireAuth from "../../backend/requireAuth";
import styled from "styled-components";
import { useCookies } from 'react-cookie';
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

const WatchPage = ({ clipMeta, authInfo, video }) => {
  const router = useRouter();
  const videoRef = useRef();
  const [cookies, setCookie] = useCookies(['theaterMode', 'videoVolume']);
  const [theaterMode, setTheaterMode] = useState(booleanify(cookies.theaterMode) || false);
  const [videoVolume, setVideoVolume] = useState(parseFloat(cookies.videoVolume) || 1)
  const [clip, setClip] = useState(video);
  const [currentURL, setCurrentURL] = useState('');
  const [fullVideoURL, setFullVideoURL] = useState('');
  const clipTitle = clip.name.split('.').slice(0, -1).join('.');

  // The video volume can't be set directly on the element for some reason, so
  // we set it immediately after rendering
  useEffect(() => {
    const url = new URL(window.location.href)
    setCurrentURL(window.location.href);
    setFullVideoURL(`${url.protocol}//${url.host}${videoSrc}`);
    if (clip && clipMeta) {
      document.title = clipTitle + " - " + publicRuntimeConfig.pageTitle;
    }
    videoRef.current.volume = videoVolume;
  }, [clip]);

  if (!clip) {
    return <div>No clip specified</div>;
  }

  if (!clipMeta) {
    return <div>404 Clip Not Found</div>;
  }

  const handleBackClick = () => {
    videoRef.current.pause();
    router.push("/");
  };

  const handleVideoError = (e) => {
    console.log("VIDEO ERROR", e.target.error);
  };

  const videoSrc = "/api/video/" + encodeURIComponent(clip.id);

  const handleVolumeChange = (e) => {
    setCookie('videoVolume', videoRef.current.volume, { path: '/' });
    setVideoVolume(videoRef.current.volume);
  };

  const toggleTheaterMode = () => {
    setCookie('theaterMode', !theaterMode, { path: '/' });
    setTheaterMode(!theaterMode);
  };

  const videoProps = {
    src: videoSrc,
    controls: true,
    autoPlay: true,
    onError: handleVideoError,
    onVolumeChange: handleVolumeChange,
    style: { outline: "none" },
    ref: videoRef,
  };

  return (
    <>

      <>
        <Head>
          <title>{clipTitle + " - " + publicRuntimeConfig.pageTitle}</title>
          <meta property="og:type" value="video.other" />
          <meta property="og:site_name" value={publicRuntimeConfig.pageTitle} />
          <meta property="og:title" value={clipTitle} />
          <meta property="og:url" value={currentURL} />

          {
            clipMeta.description && (
              <meta property="og:description" value={clipMeta.description} />
            )
          }

          <meta property="og:video" value={fullVideoURL} />
          <meta property="og:video:url" value={fullVideoURL} />
          <meta property="og:video:secure_url" value={fullVideoURL} />
          <meta property="og:video:type" content={clipMeta.mime} />
          <meta property="og:video:width" content="1280" />
          <meta property="og:video:height" content="720" />
        </Head >
      </>
      <ClipfaceLayout authInfo={authInfo} pageName="watch">
        <Container>
          <ButtonRow>
            {/* Only show "Back to clips" button to authenticated users */}
            {authInfo.status == "AUTHENTICATED" && (
              <BackLink onClick={handleBackClick}>
                <span className="icon">
                  <i className="fas fa-arrow-alt-circle-left"></i>
                </span>
                Back to clips
              </BackLink>
            )}

            {authInfo.status == "SINGLE_PAGE_AUTHENTICATED" && (
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
            {authInfo.status == "AUTHENTICATED" && (
              <>
                <CopyClipLink clip={clip} copyLink />
                {clip.requireAuth ? <CopyClipLink clip={clip} updateVideoList={setClip} privateLink /> :
                  <CopyClipLink clip={clip} updateVideoList={setClip} publicLink />
                }
                {clip.isFavorite ? <CopyClipLink clip={clip} updateVideoList={setClip} favoriteLink /> :
                  <CopyClipLink clip={clip} updateVideoList={setClip} unfavoriteLink />
                }

              </>
            )}
          </ButtonRow>
        </Container>

        <>
          <VideoContainer className={theaterMode ? "theater-mode" : ""}>
            <video {...videoProps} />
          </VideoContainer>

          {theaterMode && <VideoSpacer />}
        </>

        <Container>
          <VideoInfo>
            <h1 className="title is-4">{clipTitle}</h1>
            <h2 className="subtitle is-6">
              Uploaded <TimeAgo date={clipMeta.saved} />
              <span style={{ margin: "0px 10px" }}>•</span>
              {prettyBytes(clipMeta.size)}
            </h2>

            {clipMeta.title && <em>Filename: {clipMeta.name}</em>}

            <hr />

            {clipMeta.description && (
              <VideoDescription className="content">
                <ReactMarkdown>{clipMeta.description}</ReactMarkdown>
              </VideoDescription>
            )}
          </VideoInfo>
        </Container>
      </ClipfaceLayout>
    </>
  );
};

export const getServerSideProps = requireAuth(async ({ query, req }) => {
  const CLIPS_PATH = config.get("clips_path");

  const state = await fse.readJSON(path.join(CLIPS_PATH, "/assets/state.json"));
  let clip = state.find((clip) => { return clip.id == query.id });
  let clipMeta = await getMeta(query.id);

  if (!clipMeta) {
    clipMeta = '';
  }
  if (!clip) {
    clip = '';
  }

  return {
    props: { clipMeta, video: clip },
  };
});

export default WatchPage;
