// src/components/ToggleButton.tsx
import React from "react";
import { useCallStore } from "../store/callStore";
import styled from "styled-components";
import { theme } from "../theme";

const Button = styled.button<{ active: boolean }>`
	background-color: ${(props) => (props.active ? theme.colors.white : theme.colors.danger)};
	border: none;
	color: ${(props) => (props.active ? theme.colors.primary : theme.colors.white)};
	padding: ${theme.spacing.sm};
	margin: 0 ${theme.spacing.sm};
	font-size: 24px;
	cursor: pointer;
	border-radius: 50%;
	box-shadow: ${theme.shadows.light};
	transition: background-color ${theme.transitions.fast}, color ${theme.transitions.fast};

	&:hover {
		background-color: ${(props) => (props.active ? theme.colors.primary : "#A5001A")};
		color: ${theme.colors.white};
	}

	@media (max-width: ${theme.breakpoints.mobile}) {
		font-size: 20px;
		padding: ${theme.spacing.xs};
	}

	i {
		margin: 0;
	}
`;

interface ToggleButtonProps {
	type: "camera" | "mic";
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ type }) => {
	const { cameraOn, micOn, toggleCamera, toggleMic } = useCallStore();

	const handleClick = () => {
		if (type === "camera") {
			toggleCamera();
		} else {
			toggleMic();
		}
	};

	const isActive = type === "camera" ? cameraOn : micOn;

	return (
		<Button onClick={handleClick} active={isActive}>
			{type === "camera" ? (
				isActive ? (
					<i className='fas fa-video' />
				) : (
					<i className='fas fa-video-slash' />
				)
			) : isActive ? (
				<i className='fas fa-microphone' />
			) : (
				<i className='fas fa-microphone-slash' />
			)}
		</Button>
	);
};

export default ToggleButton;
