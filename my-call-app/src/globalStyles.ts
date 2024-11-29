// src/globalStyles.ts
import { createGlobalStyle } from "styled-components";
import { theme } from "./theme";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: ${theme.fonts.primary}, ${theme.fonts.secondary};
    background-color: ${theme.colors.background};
    color: ${theme.colors.text};
  }

  input, button {
    font-family: ${theme.fonts.primary}, ${theme.fonts.secondary};
  }
`;

export default GlobalStyle;
