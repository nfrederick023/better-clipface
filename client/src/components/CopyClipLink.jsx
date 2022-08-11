/*
 * Reusable button component for copying clip link
 */

import PropTypes from "prop-types";
import Tippy from "@tippyjs/react";

import { formatClipURL } from "../util";
import { useEffect, useState } from "react";
import updateClip from "../videoAPI";
import styled from "styled-components";


const CopyTextContainer = styled.div`
 .has-width {
    min-width: 50px
 }
 .no-width {
    min-width: 0px;
 }
`;

export default function CopyClipLink(props) {
  const [linkCopied, setLinkCopied] = useState(false);
  let popupContent = "";
  let hoverContent = "";
  let htmlContent = "";

  // Hide confirmation message after 1 second
  useEffect(() => {
    const hideMessageTimeout = setTimeout(() => {
      setLinkCopied(false);
    }, 500);

    return () => {
      clearTimeout(hideMessageTimeout);
    };
  });

  const { updateVideoList, clip, className, noText = false, favoriteLink = false,
    unfavoriteLink = false, publicLink = false, privateLink = false, copyLink = false } = props;

  const classNames = ["button", "is-small"];

  if (className) {
    classNames.push(className);
  }

  if (publicLink) {
    popupContent = "Set to Public";
    hoverContent = "Public";
    htmlContent = "Public";
  }

  if (privateLink) {
    popupContent = "Set to Private";
    hoverContent = "Private";
    htmlContent = "Private";
  }

  if (copyLink) {
    popupContent = "Link Copied";
    hoverContent = "Copy Link";
    htmlContent = "Copy Link";
  }

  if (favoriteLink) {
    popupContent = "Added to Favorites";
    hoverContent = "Favorite Clip";
    htmlContent = "Favorite Clip";
  }

  if (unfavoriteLink) {
    popupContent = "Removed from Favorites";
    hoverContent = "Unfavorite Clip";
    htmlContent = "Unfavorite Clip";
  }

  const updateNewClip = async (newClip) => {
    const updatedClip = await updateClip(clip);

    if (updatedClip) {
      updateVideoList(updatedClip);
      setLinkCopied(true);
    }
  }

  const onClick = async (e) => {
    var clipURL = formatClipURL(clip.id);

    // If we're making a public link, we need to append a single clip
    // authentication token
    if (publicLink || privateLink) {
      clip.requireAuth = !clip.requireAuth;
      updateNewClip(clip);
    }

    if (favoriteLink || unfavoriteLink) {
      clip.isFavorite = !clip.isFavorite;
      updateNewClip(clip);
    }

    if (copyLink) {
      try {
        await navigator.clipboard.writeText(clipURL.href);
        setLinkCopied(true);
      } catch (e) {
        console.error(e);
        alert("Failed to copy link!");
      }
    }

  };

  return (
    <Tippy
      content={popupContent}
      animation="shift-away-subtle"
      arrow={false}
      visible={linkCopied}
    >
      <Tippy
        content={hoverContent}
      >
        <button
          className={classNames.join(" ")}
          onClick={(e) => {
            onClick();
            e.stopPropagation();
          }}
        >

          <CopyTextContainer >
            <div className={noText ? 'no-width' : 'has-width'}>
              <span className="icon is-small">
                {copyLink && <i className="fas fa-link"></i>}
                {privateLink && <i className="fas fa-lock"></i>}
                {publicLink && <i className="fas fa-globe"></i>}
                {favoriteLink && <i className="fas fa-star"></i>}
                {unfavoriteLink && <i className="far fa-star" ></i>}
              </span>
              {!noText && <span>{htmlContent}</span>}
            </div>
          </CopyTextContainer>

        </button>
      </Tippy>
    </Tippy>
  );
}

CopyClipLink.propTypes = {
  updateVideoList: PropTypes.func,
  clip: PropTypes.object,
  className: PropTypes.string,
  noText: PropTypes.bool,
  publicLink: PropTypes.bool,
  privateLink: PropTypes.bool,
  copyLink: PropTypes.bool,
};
