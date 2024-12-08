// src/globalStyles.ts
import { createGlobalStyle } from "styled-components";
import { theme } from "./theme";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: ${theme.fonts.primary}, ${theme.fonts.secondary};
    background: ${theme.colors.background};
    color: ${theme.colors.text};
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    box-sizing: border-box;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${theme.fonts.secondary};
    margin: 0;
  }

  p {
    margin: 0;
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  input, button {
    font-family: ${theme.fonts.primary}, ${theme.fonts.secondary};
    outline: none;
    box-sizing: border-box;
  }

  button {
    cursor: pointer;
  }

  /* 반응형 이미지 */
  img {
    max-width: 100%;
    height: auto;
  }

  /* 리스트 스타일 제거 */
  ul, ol {
    padding: 0;
    margin: 0;
    list-style: none;
  }
`;

export default GlobalStyle;
