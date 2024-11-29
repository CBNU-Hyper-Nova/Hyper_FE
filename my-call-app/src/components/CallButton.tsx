// src/components/CallButton.tsx
import React from "react";
import { useCallStore } from "../store/callStore";
import styled from "styled-components";
import { theme } from "../theme";

const Button = styled.button`
	background: linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.accent});
	border: none;
	color: ${theme.colors.white};
	padding: 15px 40px;
	font-size: 18px;
	font-weight: bold;
	font-family: ${theme.fonts.primary};
	cursor: pointer;
	border-radius: 50px;
	margin: 20px;
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
	transition: transform 0.2s ease-in-out;
	display: inline-flex;
	align-items: center;

	&:hover {
		transform: scale(1.05);
	}

	i {
		margin-right: 10px;
		font-size: 24px;
	}
`;

const CallButton: React.FC = () => {
	const { startCall } = useCallStore();

	return (
		<Button onClick={startCall}>
			<i className='fas fa-video'></i> 통화 걸기
		</Button>
	);
};

export default CallButton;
