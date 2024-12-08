// src/components/common/BaseButton.tsx
import styled from "styled-components";
import { theme } from "../../theme";

const BaseButton = styled.button<{ variant?: "primary" | "secondary" | "danger" | "videoCall" }>`
	background-color: ${(props) => {
		switch (props.variant) {
			case "secondary":
				return theme.colors.secondary;
			case "danger":
				return theme.colors.danger;
			case "videoCall":
				return theme.colors.videoCall;
			default:
				return theme.colors.primary;
		}
	}};
	color: ${theme.colors.white};
	border: none;
	padding: ${theme.spacing.sm} ${theme.spacing.md};
	border-radius: ${theme.radius.sm};
	font-size: 16px;
	font-family: ${theme.fonts.primary};
	cursor: pointer;
	transition: background-color ${theme.transitions.fast}, transform ${theme.transitions.fast};
	display: inline-flex;
	align-items: center;
	justify-content: center;

	&:hover {
		background-color: ${(props) => {
			switch (props.variant) {
				case "secondary":
					return "#3FB1B0"; // Darker shade
				case "danger":
					return "#A5001A";
				case "videoCall":
					return theme.colors.videoCallDark;
				default:
					return theme.colors.primaryDark;
			}
		}};
		transform: scale(1.02);
	}

	&:disabled {
		background-color: ${theme.colors.grey};
		cursor: not-allowed;
		transform: none;
	}

	i {
		margin-right: ${theme.spacing.xs};
		font-size: 18px;
	}

	@media (max-width: ${theme.breakpoints.mobile}) {
		font-size: 14px;
		padding: ${theme.spacing.xs} ${theme.spacing.sm};
	}
`;

export default BaseButton;
