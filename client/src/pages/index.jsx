/*
 * Index page - shows a list of available clips
 */

import { useEffect, useRef, useState } from "react";
import Router from "next/router";
import styled from "styled-components";
import TimeAgo from "react-timeago";
import prettyBytes from "pretty-bytes";
import debounce from "lodash/debounce";
import { useCookies } from 'react-cookie';
import Pagination from "../components/Pagination";
import ClipfaceLayout from "../components/ClipfaceLayout";
import CopyClipLink from "../components/CopyClipLink";
import requireAuth from "../backend/requireAuth";
import Container from "../components/Container";
import booleanify from "booleanify";
import { toNumber } from "lodash";

const ClearFilterButton = styled.span`
  cursor: pointer;
  pointer-events: initial !important;
`;

const LinkRow = styled.tr`
  cursor: pointer;

  &:hover {
    background-color: #3273dc;
    color: white;
  }
`;

const RowButtons = styled.div`
  float: right;
  margin: -3px;
  display: flex;
  flex-direction: row;

  * {
    margin-right: 5px;

    &:last-child {
      margin-right: 0px;
    }
  }
`;

const NoVideosPlaceholder = styled.div`
  div {
    min-width: 100%;
    border: 1px solid #dbdbdb;
    text-align: center;
    padding: 50px;
  }

  .is-dark {
    border: 1px solid #363636;
  }
`;

const LinkHeader = styled.th`
  cursor: pointer;
`;

const IndexPage = ({ videoList, title, pagination, authInfo }) => {
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [clips, setClips] = useState([])
  const [sort, setSort] = useState('saved')
  const [isAscending, setIsAscending] = useState(true)
  const [totalClipCount, setTotalClipCount] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [cookies, setCookies] = useCookies(['clipsPerPage', 'isDarkMode']);
  const [clipsPerPage, setClipsPerPage] = useState(toNumber(cookies.clipsPerPage) || 40)
  const [videos, setVideos] = useState(videoList)
  const filterBox = useRef();

  // Focus filter box on load
  useEffect(() => {
    updatePage();
  }, [sort, currentPage, filter, isAscending, videos]);

  const updatePage = () => {
    let clipsList;

    // get sorted clips list
    clipsList = Object.values(videos).sort((a, b) => {
      return a[sort] - b[sort]
    })

    if (isAscending) {
      clipsList = clipsList.reverse();
    }

    //apply any filters
    if (filter) {
      clipsList = clipsList.filter((clip) => clip.name.toLowerCase().includes(filter));
    }

    setTotalClipCount(clipsList.length);
    const pageCount = Math.ceil(clipsList.length / clipsPerPage)

    if (isFinite(pageCount)) {
      setPageCount(pageCount);
    } else {
      setPageCount(1);
    }

    if (currentPage == -1 && pageCount - 1 > 0) {
      setCurrentPage(0);
    }
    if (currentPage > pageCount - 1) {
      setCurrentPage(pageCount - 1);
    }

    //apply any pagination
    if (pagination) {
      clipsList = clipsList.slice(
        currentPage * clipsPerPage,
        currentPage * clipsPerPage + clipsPerPage
      )
    }
    //set pages clips
    setClips(clipsList);
  }

  const changeSort = (newSort) => {
    if (newSort == sort && isAscending) {
      setIsAscending(false);
    } else {
      setIsAscending(true)
    }

    setSort(newSort);
  }

  const changePage = (pageNumber) => {
    setCurrentPage(pageNumber);
  }

  const debouncedSetFilter = debounce((text) => {
    setFilter(text)
  }, 50);

  const onFilterChange = (e) => {
    debouncedSetFilter(e.target.value);
  };

  const onClearFilterClick = () => {
    filterBox.current.value = "";
    setFilter("");
  };

  const handleLinkClick = (clipId) => {
    Router.push(`/watch/${clipId}`);
  };

  const handleChangeClipsPerPage = (newClipsPerPage) => {
    setCookies('clipsPerPage', newClipsPerPage < 1 ? 0 : newClipsPerPage, { path: '/' });
    setClipsPerPage(newClipsPerPage < 1 ? 0 : newClipsPerPage)
  };

  const updateVideoList = (clip) => {
    const newVideoList = videos.filter((video) => { return video.id != clip.id });
    newVideoList.push(clip);
    setVideos(newVideoList);
  }

  return (
    <ClipfaceLayout authInfo={authInfo} pageName="index" pageTitle={title}>
      <Container>
        <div className="field">
          <label className="label">Search</label>

          <div className="control has-icons-right">
            <input
              type="text"
              className="input"
              ref={filterBox}
              onChange={onFilterChange}
            />

            <ClearFilterButton
              className="icon is-right"
              onClick={onClearFilterClick}
            >
              <i className="fas fa-times" />
            </ClearFilterButton>
          </div>
        </div>

        {pagination && (
          <Pagination
            currentPage={currentPage}
            totalPages={pageCount}
            totalClips={totalClipCount}
            clipsPerPage={clipsPerPage}
            onChangePage={(pageNumber) => changePage(pageNumber)}
            onChangeClipsPerPage={handleChangeClipsPerPage}
            showLabel
          />
        )}

        <table
          className="table is-fullwidth is-bordered"
          style={{ marginBottom: 0 }} // Remove bottom margin added by Bulma
        >
          <thead>
            <tr>
              <LinkHeader onClick={() => {
                changeSort("created");
              }} width="150px">Created</LinkHeader>
              <LinkHeader onClick={() => {
                changeSort("saved");
              }} width="150px">Uploaded</LinkHeader>
              <LinkHeader onClick={() => {
                changeSort("size");
              }}
                width="100px">Size</LinkHeader>
              <LinkHeader onClick={() => {
                changeSort("name");
              }}
              >Name</LinkHeader>
            </tr>
          </thead>

          <tbody>
            {clips.map((clip) => (
              <LinkRow
                key={clip.name}
                onClick={() => {
                  handleLinkClick(clip.id);
                }}
              >
                <td>
                  <TimeAgo date={clip.created} />
                </td>
                <td>
                  <TimeAgo date={clip.saved} />
                </td>
                <td>{prettyBytes(clip.size)}</td>
                <td>
                  {clip.title || clip.name.split('.').slice(0, -1).join('.')}

                  <RowButtons>
                    <CopyClipLink clip={clip} noText copyLink />

                    {authInfo.status == "AUTHENTICATED" && (
                      // There's no point in showing the "Copy public link"
                      // button if Clipface is not password protected
                      <>
                        {
                          clip.requireAuth ?
                            <CopyClipLink clip={clip} updateVideoList={updateVideoList} noText privateLink /> :
                            <CopyClipLink clip={clip} updateVideoList={updateVideoList} noText publicLink />
                        }
                        {
                          clip.isFavorite ?
                            <CopyClipLink clip={clip} updateVideoList={updateVideoList} noText favoriteLink /> :
                            <CopyClipLink clip={clip} updateVideoList={updateVideoList} noText unfavoriteLink />
                        }
                      </>
                    )}

                  </RowButtons>
                </td>
              </LinkRow>
            ))}
          </tbody>
        </table>

        {clips.length == 0 && (
          <NoVideosPlaceholder><div className={booleanify(cookies.isDarkMode) ? 'is-dark' : ''}>No clips Found</div></NoVideosPlaceholder>
        )}

        {pagination && (
          <Pagination
            currentPage={currentPage}
            totalPages={pageCount}
            totalClips={totalClipCount}
            clipsPerPage={clipsPerPage}
            onChangeClipsPerPage={handleChangeClipsPerPage}
            onChangePage={(newPageNumber) => setCurrentPage(newPageNumber)}
          />
        )}
      </Container>
    </ClipfaceLayout>
  );
};

export const getServerSideProps = requireAuth(async (context) => {
  let videoList = [];

  const config = require("config");

  const { checkAuth } = require("../backend/auth");

  if (await checkAuth(context.req)) {
    const listClips = require("../backend/listClips").default;

    videoList = await listClips();
  }

  return {
    props: {
      videoList,
      pagination: config.get("pagination"),
      title: config.has("clips_page_title")
        ? config.get("clips_page_title")
        : null,
    },
  };
});

export default IndexPage;
