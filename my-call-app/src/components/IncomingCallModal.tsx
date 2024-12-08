// src/components/IncomingCallModal.tsx
import React from "react";
import { useCallStore } from "../store/callStore";
import styled, { keyframes } from "styled-components";
import { theme } from "../theme";
import BaseButton from "./common/BaseButton";
import { useSignaling } from "../hooks/useSignaling";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

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
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
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

const IncomingCallModal = () => {
	const { isReceiving, callerInfo, setIsReceiving, setIsInCall, setLocalStream } = useCallStore();
	const user = useAuthStore(state => state.user);
	const navigate = useNavigate();
	const { sendMessage } = useSignaling(user?.signalingId || '');

	console.log('IncomingCallModal render:', { isReceiving, callerInfo });

	if (!isReceiving || !callerInfo) return null;

	const handleReject = () => {
        if (callerInfo && user?.signalingId) {
            try {
                sendMessage('call-reject', {
                    type: 'call-reject',
                    from: user.signalingId,
                    to: callerInfo.id,
                    payload: {
                        type: 'video'
                    }
                });
                
                // callStore.setState 대신 hook 사용
                setIsReceiving(false);
                setCallerInfo(null);
                
                navigate('/friends');
            } catch (error) {
                console.error('거절 처리 중 에러:', error);
            }
        }
    };

	const handleAccept = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            setLocalStream(stream);
            
            if (user?.signalingId && callerInfo) {
                sendMessage('call-accept', {
                    type: 'call-accept',  // type 필드 추가
                    to: callerInfo.id,
                    payload: {            // payload 구조 맞추기
                        type: 'video'
                    }
                });
            }
            
            setIsReceiving(false);
            setIsInCall(true);
            navigate('/video-call');
        } catch (error) {
            console.error('handleAccept 오류:', error);
            alert('통화 연결에 실패했습니다: ' + error.message);
        }
    };

    if (!callerInfo) return null;


	return (
		<ModalOverlay>
			<ModalContent>
				<Title>📲 {callerInfo.id}님의 영상 통화 요청</Title>
				<ButtonGroup>
					<Button accept onClick={handleAccept} variant='primary'>
						<i className='fas fa-phone'></i> 수락
					</Button>
					<Button onClick={handleReject} variant='danger'>
						<i className='fas fa-phone-slash'></i> 거절
					</Button>
				</ButtonGroup>
			</ModalContent>
		</ModalOverlay>
	);
};

export default IncomingCallModal;
