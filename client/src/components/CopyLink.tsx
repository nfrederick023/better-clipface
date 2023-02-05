import { FC, useEffect, useState } from "react";

import { CopyLinkProps, LinkTypes, Video } from "../constants/interfaces";
import Tippy from "@tippyjs/react";
import styled from "styled-components";
import updateClip from "../constants/api/video";

const CopyTextContainer = styled.span`
 .favorite {
    width: 100px
 }
 .private {
   width: 80px;
 }
`;


const CopyLink: FC<CopyLinkProps> = ({ updateVideoList, clip, noText = false, linkType }) => {
  const [linkCopied, setLinkCopied] = useState(false);
  let popupContent = "";
  let hoverContent = "";
  let htmlContent = "";
  let css = "";

  // Hide confirmation message after 1 second
  useEffect(() => {
    const hideMessageTimeout = setTimeout(() => {
      setLinkCopied(false);
    }, 500);

    return (): void => {
      clearTimeout(hideMessageTimeout);
    };
  });

  if (linkType === LinkTypes.publicLink) {
    css = "private";
    popupContent = "Set to Public";
    hoverContent = "Public";
    htmlContent = "Public";
  }

  if (linkType === LinkTypes.privateLink) {
    css = "private";
    popupContent = "Set to Private";
    hoverContent = "Private";
    htmlContent = "Private";
  }

  if (linkType === LinkTypes.copyLink) {
    popupContent = "Link Copied";
    hoverContent = "Copy Link";
    htmlContent = "Copy Link";
  }

  if (linkType === LinkTypes.unfavoriteLink) {
    css = "favorite";
    popupContent = "Removed from Favorites";
    hoverContent = "Favorite";
    htmlContent = "Favorite";
  }

  if (linkType === LinkTypes.favoriteLink) {
    css = "favorite";
    popupContent = "Added to Favorites";
    hoverContent = "Unfavorite";
    htmlContent = "Unfavorite";
  }

  const updateNewClip = async (newClip: Video): Promise<void> => {
    if (updateVideoList) {
      const updatedClip = await updateClip(newClip);
      if (updatedClip.body) {
        updateVideoList(await updatedClip.json());
        setLinkCopied(true);
      }
    }
  };

  const onClick = async (): Promise<void> => {
    const clipID = clip.id;
    const baseURL = window.location.origin;

    // If we're making a public link, we need to append a single clip
    // authentication token
    if (linkType === LinkTypes.publicLink || linkType === LinkTypes.privateLink) {
      clip.requireAuth = !clip.requireAuth;
      updateNewClip(clip);
    }

    if (linkType === LinkTypes.favoriteLink || linkType === LinkTypes.unfavoriteLink) {
      clip.isFavorite = !clip.isFavorite;
      updateNewClip(clip);
    }

    if (linkType === LinkTypes.copyLink) {
      try {
        await navigator.clipboard.writeText(baseURL + "/watch/" + clipID);
        setLinkCopied(true);
      } catch (e) {
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
        <CopyTextContainer >

          <button
            className={(!noText ? css : "") + " button is-small"}
            onClick={(e): void => {
              onClick();
              e.stopPropagation();
            }}
          >

            <span className="icon is-small">
              {linkType === LinkTypes.copyLink && <i className="fas fa-link"></i>}
              {linkType === LinkTypes.privateLink && <i className="fas fa-lock"></i>}
              {linkType === LinkTypes.publicLink && <i className="fas fa-globe"></i>}
              {linkType === LinkTypes.favoriteLink && <i className="fas fa-star"></i>}
              {linkType === LinkTypes.unfavoriteLink && <i className="far fa-star" ></i>}
            </span>
            {!noText && <span >{htmlContent}</span>}
          </button>
        </CopyTextContainer>
      </Tippy>
    </Tippy>
  );
};

export default CopyLink;