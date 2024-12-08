// src/components/CallButton.tsx
import React from "react";
import { useCallStore } from "../store/callStore";
import styled from "styled-components";
import { theme } from "../theme";
import BaseButton from "./common/BaseButton";

const StyledButton = styled(BaseButton)`
	background: linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.accent});
	padding: ${theme.spacing.sm} ${theme.spacing.lg};
	font-size: 18px;
	border-radius: ${theme.radius.round};
	box-shadow: ${theme.shadows.medium};
	transition: transform ${theme.transitions.fast};

	&:hover {
		transform: scale(1.05);
	}

	i {
		margin-right: ${theme.spacing.xs};
		font-size: 20px;
	}

	@media (max-width: ${theme.breakpoints.mobile}) {
		font-size: 16px;
		padding: ${theme.spacing.xs} ${theme.spacing.md};
	}
`;

const CallButtonComponent: React.FC = () => {
	const { startCall } = useCallStore();

	return (
		<StyledButton onClick={startCall} variant='primary'>
			<i className='fas fa-video'></i> 통화 걸기
		</StyledButton>
	);
};

export default CallButtonComponent;
