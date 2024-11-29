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

const AppContainer = styled.div`
	font-family: ${theme.fonts.primary};
	background-color: ${theme.colors.background};
	min-height: 100vh;
`;

const Header = styled.header`
	background: linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.accent});
	color: ${theme.colors.white};
	padding: 20px;
	text-align: center;
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
	position: relative;

	button {
		position: absolute;
		right: 20px;
		top: 15px;
		background: none;
		border: none;
		color: ${theme.colors.white};
		font-size: 18px;
		cursor: pointer;
		&:hover {
			text-decoration: underline;
		}
	}
`;

const MainContent = styled.main`
	text-align: center;
	padding: 50px 20px;
`;

const App: React.FC = () => {
	const { isInCall, isReceiving, isCalling, isCallPending } = useCallStore();
	const { isAuthenticated, logout } = useAuthStore();
	const [isSignUp, setIsSignUp] = useState(false);

	useEffect(() => {
		// 수신 모킹
		const timer = setTimeout(() => {
			if (!isInCall && !isCalling) {
				useCallStore.setState({ isReceiving: true });
			}
		}, 5000);

		return () => clearTimeout(timer);
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
