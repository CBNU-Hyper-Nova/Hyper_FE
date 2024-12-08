// src/App.tsx
import React, { useEffect, useState } from "react";
import { useCallStore } from "./store/callStore";
import { useAuthStore } from "./store/authStore";
import FriendsList from "./components/FriendsList";
import IncomingCallModal from "./components/IncomingCallModal";
import VideoCall from "./components/VideoCall";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import CallPending from "./components/CallPending"; // 새로운 컴포넌트 임포트
import styled from "styled-components";
import GlobalStyle from "./globalStyles";
import { theme } from "./theme";
import { useSignaling } from "./hooks/useSignaling";

const AppContainer = styled.div`
	font-family: ${theme.fonts.primary};
	background: ${theme.colors.background};
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center; /* 중앙 정렬 */
	justify-content: center; /* 중앙 정렬 */
	padding: ${theme.spacing.md};
	box-sizing: border-box;
`;

const Header = styled.header`
	background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent});
	color: ${theme.colors.white};
	padding: ${theme.spacing.md};
	text-align: center;
	border-radius: ${theme.radius.md};
	box-shadow: ${theme.shadows.medium};
	width: 100%;
	max-width: 800px;
	margin-bottom: ${theme.spacing.lg};
	position: relative;

	h1 {
		margin: 0;
		font-size: 28px;
	}

	button {
		position: absolute;
		right: ${theme.spacing.md};
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: ${theme.colors.white};
		font-size: 18px;
		cursor: pointer;
		transition: color ${theme.transitions.fast};

		&:hover {
			color: ${theme.colors.secondary};
		}

		@media (max-width: ${theme.breakpoints.mobile}) {
			font-size: 16px;
			right: ${theme.spacing.sm};
		}
	}
`;

const MainContent = styled.main`
	flex: 1;
	text-align: center;
	padding: ${theme.spacing.xl} ${theme.spacing.md};
	width: 100%;
	max-width: 800px;

	@media (max-width: ${theme.breakpoints.mobile}) {
		padding: ${theme.spacing.lg} ${theme.spacing.sm};
	}
`;

const App: React.FC = () => {
	useSignaling(); // 시그널링 초기화

	const { isInCall, isReceiving, isCalling, isCallPending } = useCallStore();
	const { isAuthenticated, logout } = useAuthStore();
	const [isSignUp, setIsSignUp] = useState(false);

	useEffect(() => {
		// 수신 모킹 (백엔드에서 실제 구현 시 삭제)
		// const timer = setTimeout(() => {
		// 	if (!isInCall && !isCalling) {
		// 		useCallStore.setState({ isReceiving: true });
		// 	}
		// }, 5000);
		// return () => clearTimeout(timer);
	}, [isInCall, isCalling]);

	if (!isAuthenticated) {
		return (
			<>
				<GlobalStyle />
				<AppContainer>
					<Header>
						<h1>🌐 영상 통화 앱</h1>
					</Header>
					<MainContent>
						{isSignUp ? (
							<SignUp toggleAuth={() => setIsSignUp(false)} />
						) : (
							<Login toggleAuth={() => setIsSignUp(true)} />
						)}
					</MainContent>
				</AppContainer>
			</>
		);
	}

	return (
		<>
			<GlobalStyle />
			<AppContainer>
				<Header>
					<h1>🌐 영상 통화 앱</h1>
					<button onClick={logout}>로그아웃</button>
				</Header>
				<MainContent>
					{isCallPending && <CallPending />}
					{isReceiving && <IncomingCallModal />}
					{isInCall && <VideoCall />}
					{!isInCall && !isReceiving && !isCalling && !isCallPending && <FriendsList />}
				</MainContent>
			</AppContainer>
		</>
	);
};

export default App;
