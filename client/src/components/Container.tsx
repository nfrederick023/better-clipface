/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/*
 * Adds left and right margin to maintain a minimum size
 */

import styled from "styled-components";

const width = 1344;
const padding = 12;

const Container = styled.div`
  max-width: ${(props: any) => props.noPadding ? width : width + padding * 2}px;
  margin: 0 auto;

  ${(props: any) => props.noPadding ? "" : `
    padding-left: ${padding}px;
    padding-right: ${padding}px;
  `}
`;

export default Container;
