/*
 * Index page - shows a list of available clips
 */

import { AuthStatus, IndexPageProps, LinkTypes, SortTypes, Video } from "../constants/interfaces";
import { FC, MutableRefObject, useEffect, useRef, useState } from "react";

import Container from "../components/Container";
import CopyClipLink from "../components/CopyLink";
import Pagination from "../components/Pagination";
import Router from "next/router";
import TimeAgo from "react-timeago";
import debounce from "lodash/debounce";
import listClips from "../services/listClips";
import prettyBytes from "pretty-bytes";
import requireAuth from "../services/requireAuth";
import styled from "styled-components";
import { toNumber } from "lodash";
import { useCookies } from "react-cookie";

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

const LinkHeader = styled.th<{ width?: string }>`
  cursor: pointer;
`;

const IndexPage: FC<IndexPageProps> = ({ allClips, authStatus }) => {
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [clips, setClips] = useState<Video[]>([]);
  const [sort, setSort] = useState(SortTypes.saved);
  const [isAscending, setIsAscending] = useState(true);
  const [isOnlyFavorites, setIsOnlyFavorites] = useState(false);
  const [totalClipCount, setTotalClipCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [cookies, setCookies] = useCookies(["clipsPerPage", "isDarkMode"]);
  const [intialClipList, setIntialClipList] = useState(allClips);
  const filterBox = useRef() as MutableRefObject<HTMLInputElement>;

  // Focus filter box on load
  useEffect(() => {
    updatePage();
  }, [sort, currentPage, filter, isAscending, intialClipList, cookies, isOnlyFavorites]);

  const updatePage = (): void => {
    const clipsPerPage = toNumber(cookies.clipsPerPage);
    let sortedClips;

    // get sorted clips list
    sortedClips = Object.values(intialClipList).sort((a, b) => {
      return (a[SortTypes[sort]] as number) - (b[SortTypes[sort]] as number);
    });

    if (isAscending) {
      sortedClips = sortedClips.reverse();
    }

    //apply any filters
    if (filter) {
      sortedClips = sortedClips.filter((clip) => clip.name.toLowerCase().includes(filter));
    }

    if (isOnlyFavorites) {
      sortedClips = sortedClips.filter(clip => clip.isFavorite)
    }

    setTotalClipCount(sortedClips.length);
    const pageCount = Math.ceil(sortedClips.length / clipsPerPage);

    if (isFinite(pageCount)) {
      setPageCount(pageCount);
    } else {
      setPageCount(1);
    }

    if (currentPage === -1 && (pageCount - 1 > 0 && sortedClips.length)) {
      setCurrentPage(0);
    }

    if (currentPage > pageCount - 1) {
      setCurrentPage(pageCount - 1);
    }

    //apply any pagination
    sortedClips = sortedClips.slice(
      currentPage * clipsPerPage,
      currentPage * clipsPerPage + clipsPerPage
    );

    //set pages clips
    setClips(sortedClips);
  };

  const changeSort = (newSort: SortTypes): void => {
    if (newSort === sort && isAscending) {
      setIsAscending(false);
    } else {
      setIsAscending(true);
    }

    setSort(newSort);
  };

  const changePage = (pageNumber: number): void => {
    setCurrentPage(pageNumber);
  };

  const debouncedSetFilter = debounce((text) => {
    setFilter(text);
  }, 50);

  const onFilterChange = (searchText: string): void => {
    debouncedSetFilter(searchText);
  };

  const onClearFilterClick = (): void => {
    filterBox.current.value = "";
    setFilter("");
  };

  const handleLinkClick = (clipId: string): void => {
    Router.push(`/watch/${clipId}`);
  };

  const handleChangeClipsPerPage = (newClipsPerPage: number): void => {
    setCookies("clipsPerPage", newClipsPerPage < 1 ? 0 : newClipsPerPage, { path: "/" });
  };

  const updateVideoList = (selectedClip: Video): void => {
    const newVideoList = allClips.filter((clip) => { return clip.id !== selectedClip.id; });
    newVideoList.push(selectedClip);
    setIntialClipList(newVideoList);
  };

  return (
    <Container>
      <div className='field'>
        <label className='label'>Search</label>

        <div className='control has-icons-right'>
          <input
            type='text'
            className='input'
            ref={filterBox}
            onChange={(event): void => onFilterChange(event.target.value)}
          />

          <ClearFilterButton
            className='icon is-right'
            onClick={onClearFilterClick}
          >
            <i className='fas fa-times' />
          </ClearFilterButton>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={pageCount}
        totalClips={totalClipCount}
        showFavoritesButton={true}
        isOnlyFavorites={isOnlyFavorites}
        clipsPerPage={toNumber(cookies.clipsPerPage)}
        setIsOnlyFavorite={setIsOnlyFavorites}
        onChangePage={(pageNumber): void => changePage(pageNumber)}
        onChangeClipsPerPage={handleChangeClipsPerPage}
        showLabel
      />

      <table
        className='table is-fullwidth is-bordered'
        style={{ marginBottom: 0 }} // Remove bottom margin added by Bulma
      >
        <thead>
          <tr>
            <LinkHeader onClick={(): void => { changeSort(SortTypes.created); }} width='150px'>
              Created
            </LinkHeader>
            <LinkHeader onClick={(): void => { changeSort(SortTypes.saved); }} width='150px'>
              Uploaded
            </LinkHeader>
            <LinkHeader onClick={(): void => { changeSort(SortTypes.size); }} width='100px'>
              Size
            </LinkHeader>
            <LinkHeader onClick={(): void => { changeSort(SortTypes.name); }}>
              Name
            </LinkHeader>
          </tr>
        </thead>

        <tbody>
          {clips.map((clip) => (
            <LinkRow
              key={clip.name}
              onClick={(): void => {
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
                {clip.title || clip.name.split(".").slice(0, -1).join(".")}

                <RowButtons>
                  <CopyClipLink clip={clip} noText={true} linkType={LinkTypes.copyLink} />

                  {authStatus === AuthStatus.authenticated && (
                    // There's no point in showing the "Copy public link"
                    // button if Clipface is not password protected
                    <>
                      {
                        clip.requireAuth ?
                          <CopyClipLink clip={clip} updateVideoList={updateVideoList} noText={true} linkType={LinkTypes.privateLink} /> :
                          <CopyClipLink clip={clip} updateVideoList={updateVideoList} noText={true} linkType={LinkTypes.publicLink} />
                      }
                      {
                        clip.isFavorite ?
                          <CopyClipLink clip={clip} updateVideoList={updateVideoList} noText={true} linkType={LinkTypes.favoriteLink} /> :
                          <CopyClipLink clip={clip} updateVideoList={updateVideoList} noText={true} linkType={LinkTypes.unfavoriteLink} />
                      }
                    </>
                  )}

                </RowButtons>
              </td>
            </LinkRow>
          ))}
        </tbody>
      </table>

      {clips.length === 0 && (
        <NoVideosPlaceholder><div className={cookies.isDarkMode === "true" ? "is-dark" : ""}>No clips Found</div></NoVideosPlaceholder>
      )}

      <Pagination
        showLabel={false}
        currentPage={currentPage}
        totalPages={pageCount}
        showFavoritesButton={false}
        isOnlyFavorites={isOnlyFavorites}
        totalClips={totalClipCount}
        clipsPerPage={toNumber(cookies.clipsPerPage)}
        onChangeClipsPerPage={handleChangeClipsPerPage}
        onChangePage={(newPageNumber): void => setCurrentPage(newPageNumber)}
      />

    </Container>
  );
};

export const getServerSideProps = requireAuth(async () => {
  let allClips: Video[] = [];
  allClips = await listClips();
  return {
    props: {
      allClips,
    }
  };
});

export default IndexPage;
