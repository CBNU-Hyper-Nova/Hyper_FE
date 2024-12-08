// src/components/DetectedSentence.tsx
import React from "react";
import { useCallStore } from "../store/callStore";
import styled, { keyframes } from "styled-components";
import { theme } from "../theme";

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const SentenceContainer = styled.div`
	text-align: center;
	margin-top: ${theme.spacing.md};
`;

const SentenceText = styled.p`
	display: inline-block;
	background: linear-gradient(135deg, ${theme.colors.secondary}, ${theme.colors.accent});
	color: ${theme.colors.white};
	padding: ${theme.spacing.sm} ${theme.spacing.md};
	border-radius: ${theme.radius.round};
	font-size: 28px;
	font-weight: bold;
	font-family: ${theme.fonts.secondary};
	animation: ${fadeInUp} 0.5s ease-in-out;
	box-shadow: ${theme.shadows.light};
	transition: opacity ${theme.transitions.fast};

	@media (max-width: ${theme.breakpoints.mobile}) {
		font-size: 20px;
		padding: ${theme.spacing.xs} ${theme.spacing.sm};
	}
`;

const DetectedSentence: React.FC = () => {
	const { detectedSentence } = useCallStore();

	if (!detectedSentence) return null;

	return (
		<SentenceContainer>
			<SentenceText>{detectedSentence}</SentenceText>
		</SentenceContainer>
	);
};

export default DetectedSentence;
