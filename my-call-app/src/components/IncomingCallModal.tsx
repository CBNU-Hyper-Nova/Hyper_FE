// src/components/IncomingCallModal.tsx
import React from "react";
import { useCallStore } from "../store/callStore";
import styled, { keyframes } from "styled-components";
import { theme } from "../theme";
import BaseButton from "./common/BaseButton";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const ModalOverlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: ${theme.colors.modalOverlay};
	display: flex;
	justify-content: center;
	align-items: center;
	animation: ${fadeIn} 0.3s ease-in-out;
	z-index: 1000;
`;

const ModalContent = styled.div`
	background-color: ${theme.colors.white};
	padding: ${theme.spacing.lg};
	border-radius: ${theme.radius.lg};
	text-align: center;
	max-width: 400px;
	width: 90%;
	box-shadow: ${theme.shadows.heavy};

	@media (max-width: ${theme.breakpoints.mobile}) {
		padding: ${theme.spacing.md};
	}
`;

const Title = styled.h2`
	font-family: ${theme.fonts.secondary};
	margin-bottom: ${theme.spacing.md};
	font-size: 24px;

	@media (max-width: ${theme.breakpoints.mobile}) {
		font-size: 20px;
	}
`;

const ButtonGroup = styled.div`
	display: flex;
	justify-content: center;
	gap: ${theme.spacing.sm};

	@media (max-width: ${theme.breakpoints.mobile}) {
		flex-direction: column;
		gap: ${theme.spacing.xs};
	}
`;

const Button = styled(BaseButton)<{ accept?: boolean }>`
	background-color: ${(props) => (props.accept ? theme.colors.primary : theme.colors.danger)};
	width: 150px;

	&:hover {
		background-color: ${(props) => (props.accept ? "#357ABD" : "#A5001A")};
	}

	@media (max-width: ${theme.breakpoints.mobile}) {
		width: 100%;
	}

	i {
		margin-right: ${theme.spacing.xs};
		font-size: 20px;
	}
`;

const IncomingCallModal: React.FC = () => {
	const { isReceiving, receiveCall, rejectCall } = useCallStore();

	if (!isReceiving) return null;

	return (
		<ModalOverlay>
			<ModalContent>
				<Title>📲 새로운 영상 통화가 도착했습니다</Title>
				<ButtonGroup>
					<Button accept onClick={receiveCall} variant='primary'>
						<i className='fas fa-phone'></i> 수락
					</Button>
					<Button onClick={rejectCall} variant='danger'>
						<i className='fas fa-phone-slash'></i> 거절
					</Button>
				</ButtonGroup>
			</ModalContent>
		</ModalOverlay>
	);
};

export default IncomingCallModal;
