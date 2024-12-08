// src/components/common/Card.tsx
import styled from "styled-components";
import { theme } from "../../theme";

const Card = styled.div`
	background-color: ${theme.colors.white};
	border-radius: ${theme.radius.md};
	padding: ${theme.spacing.md};
	margin: ${theme.spacing.sm} 0;
	box-shadow: ${theme.shadows.light};
	transition: box-shadow ${theme.transitions.fast}, transform ${theme.transitions.fast};
	display: flex;
	align-items: center;
	justify-content: space-between;

	&:hover {
		box-shadow: ${theme.shadows.medium};
		transform: translateY(-2px);
	}

	@media (max-width: ${theme.breakpoints.mobile}) {
		flex-direction: column;
		align-items: flex-start;
	}
`;

export default Card;
