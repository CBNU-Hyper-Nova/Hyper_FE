// src/components/IncomingCallModal.tsx
import React from "react";
import { useCallStore } from "../store/callStore";
import styled, { keyframes } from "styled-components";
import { theme } from "../theme";

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
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	animation: ${fadeIn} 0.3s ease-in-out;
`;

const ModalContent = styled.div`
	background-color: ${theme.colors.white};
	padding: 40px;
	border-radius: 15px;
	text-align: center;
	max-width: 90%;
	box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
	font-family: ${theme.fonts.secondary};
	margin-bottom: 30px;
	font-size: 24px;
`;

const ButtonGroup = styled.div`
	display: flex;
	justify-content: center;
`;

const Button = styled.button<{ accept?: boolean }>`
	background-color: ${(props) => (props.accept ? theme.colors.primary : theme.colors.danger)};
	border: none;
	color: ${theme.colors.white};
	padding: 15px 30px;
	margin: 0 10px;
	font-size: 18px;
	font-family: ${theme.fonts.primary};
	cursor: pointer;
	border-radius: 50px;
	min-width: 150px;
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
	transition: background-color 0.2s ease-in-out;

	&:hover {
		background-color: ${(props) => (props.accept ? "#357ABD" : "#A5001A")};
	}

	i {
		margin-right: 8px;
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
					<Button accept onClick={receiveCall}>
						<i className='fas fa-phone'></i> 수락
					</Button>
					<Button onClick={rejectCall}>
						<i className='fas fa-phone-slash'></i> 거절
					</Button>
				</ButtonGroup>
			</ModalContent>
		</ModalOverlay>
	);
};

export default IncomingCallModal;
