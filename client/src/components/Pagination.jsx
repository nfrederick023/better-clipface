import { useEffect, useState } from "react";

import Popup from "reactjs-popup";
import PropTypes from "prop-types";
import range from "lodash/range";
import styled from "styled-components";

const PaginationBar = styled.div`
  margin: 10px 0px;
  margin-bottom: 10px;
  border-radius: 2px;

  .is-current{
    background-color: #3273dc !important;
  }
`;

const SubmenuButton = styled.div`
  cursor: pointer;
  box-sizing: border-box;
  padding: 3px 5px;
  opacity: 0.5;
`;

const ClickableTag = styled.span`
  cursor: pointer;
`;

export default function Pagination(props) {

  const {
    totalPages,
    currentPage,
    clipsPerPage,
    onChangePage,
    onChangeClipsPerPage,
    showLabel,
  } = props;

  const [clipsPerPageDisplay, setclipsPerPageDisplay] = useState(clipsPerPage);

  useEffect(() => {
    if (!clipsPerPage) {
      setclipsPerPageDisplay('');
    } else {
      setclipsPerPageDisplay(clipsPerPage);
    }
  }, [clipsPerPage]);


  const onFirstPage = currentPage == 0;
  const onLastPage = currentPage == totalPages - 1;

  const changeClipsPerPage = (newNumber) => {
    onChangeClipsPerPage && onChangeClipsPerPage(newNumber);
  };

  return (
    <div className="field">
      {showLabel && <label className="label">Page</label>}

      <PaginationBar>
        <nav className="pagination is-small">
          <ul className="pagination-list">
            {range(0, totalPages).map((i) => (
              <li key={i}>
                <a
                  className={
                    "pagination-link" + (currentPage == i ? " is-current" : "")
                  }
                  onTouchStart={() => {
                    if (i != currentPage) {
                      onChangePage(i);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevents grabbing focus

                    if (i != currentPage) {
                      onChangePage(i);
                    }
                  }}
                >
                  {i + 1}
                </a>
              </li>
            ))}

            <li suppressHydrationWarning={true}>
              {process.browser && <Popup
                trigger={
                  <SubmenuButton >
                    <span className="icon">
                      <i className="fas fa-cog"></i>
                    </span>
                  </SubmenuButton>
                }
                overlayStyle={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                // On screens narrower than 768, show the settings popup as a
                // modal rather than a dropdown menu
                modal={typeof window !== "undefined" && window.innerWidth < 768}
                repositionOnResize
                keepTooltipInside="body"
              >
                <div className="dropdown-content">
                  <div className="dropdown-item">Clips per page:</div>
                  <div className="dropdown-item">
                    <input
                      className="input is-small"
                      type="number"
                      value={clipsPerPageDisplay}
                      onChange={(event) =>
                        changeClipsPerPage(Number(event.target.value))
                      }
                    />
                  </div>
                  <div className="dropdown-item">
                    <div className="tags" style={{ flexWrap: "nowrap" }}>
                      <ClickableTag
                        className="tag is-info"
                        onClick={() => changeClipsPerPage(20)}
                      >
                        20
                      </ClickableTag>
                      <ClickableTag
                        className="tag is-info"
                        onClick={() => changeClipsPerPage(40)}
                      >
                        40
                      </ClickableTag>
                      <ClickableTag
                        className="tag is-primary"
                        onClick={() => changeClipsPerPage(80)}
                      >
                        80
                      </ClickableTag>
                      <ClickableTag
                        className="tag is-warning"
                        onClick={() => changeClipsPerPage(150)}
                      >
                        150
                      </ClickableTag>
                      <ClickableTag
                        className="tag is-danger"
                        onClick={() => changeClipsPerPage(300)}
                      >
                        300
                      </ClickableTag>
                    </div>
                  </div>
                </div>
              </Popup>}
            </li>
          </ul>

          <a
            className="pagination-previous"
            onClick={() => {
              if (onFirstPage) return;

              onChangePage(currentPage - 1);
            }}
            style={{ order: 3, padding: "5px 3px" }}
            disabled={onFirstPage}
          >
            <span className="icon">
              <i className="fas fa-caret-left"></i>
            </span>
          </a>

          <a
            className="pagination-next"
            onClick={() => {
              if (onLastPage) return;

              onChangePage(currentPage + 1);
            }}
            style={{ order: 3, padding: "5px 3px" }}
            disabled={onLastPage}
          >
            <span className="icon">
              <i className="fas fa-caret-right"></i>
            </span>
          </a>
        </nav>
      </PaginationBar>
    </div >
  );
}

Pagination.propTypes = {
  totalPages: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  totalClips: PropTypes.number.isRequired,
  clipsPerPage: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  onChangeClipsPerPage: PropTypes.func.isRequired,
  showLabel: PropTypes.bool,
};
