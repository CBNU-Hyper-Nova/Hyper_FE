// src/components/common/Container.tsx
import styled from "styled-components";
import { theme } from "../../theme";

const Container = styled.div<{ maxWidth?: string; padding?: string; margin?: string }>`
	max-width: ${(props) => props.maxWidth || "600px"};
	margin: ${(props) => props.margin || `${theme.spacing.lg} auto`};
	padding: ${(props) => props.padding || "0"};
	box-sizing: border-box;
	background-color: rgba(255, 255, 255, 0.9); /* 약간의 투명도를 주어 배경과 조화롭게 */

	@media (max-width: ${theme.breakpoints.tablet}) {
		max-width: 90%;
		margin: ${theme.spacing.md} auto;
	}
`;

export default Container;
