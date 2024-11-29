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
	margin-top: 20px;
`;

const SentenceText = styled.p`
	display: inline-block;
	background: linear-gradient(45deg, ${theme.colors.secondary}, ${theme.colors.accent});
	color: ${theme.colors.white};
	padding: 20px 30px;
	border-radius: 50px;
	font-size: 28px;
	font-weight: bold;
	font-family: ${theme.fonts.secondary};
	animation: ${fadeInUp} 0.5s ease-in-out;
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
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
