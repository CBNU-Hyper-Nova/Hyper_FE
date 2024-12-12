// src/App.tsx
import React, { useEffect, useState } from "react";
import { useCallStore } from "./store/callStore";
import { useAuthStore } from "./store/authStore";
import FriendsList from "./components/FriendsList";
import IncomingCallModal from "./components/IncomingCallModal";
import VideoCall from "./components/VideoCall";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import CallPending from "./components/CallPending";
import styled from "styled-components";
import GlobalStyle from "./globalStyles";
import { theme } from "./theme";
import { useSignaling } from "./hooks/useSignaling";
import CallButton from "./components/CallButton";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const AppContainer = styled.div`
	font-family: ${theme.fonts.primary};
	background: ${theme.colors.background};
	min-height: 100vh;
	width: 100vw;
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
	width: 97%;
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
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	padding: ${theme.spacing.xl} ${theme.spacing.md};
	width: 100%;
	height: 100%; /* 부모 컨테이너의 높이를 채우도록 설정 */

	@media (max-width: ${theme.breakpoints.mobile}) {
		padding: ${theme.spacing.lg} ${theme.spacing.sm};
		width: 90%; /* 작은 화면에서는 더 좁게 설정 */
	}
`;

const App: React.FC = () => {
	const { user } = useAuthStore();
	const { sendMessage } = useSignaling(user?.signalingId || "");

	const { isInCall, isReceiving, isCalling, isPending } = useCallStore();
	const { isAuthenticated, logout } = useAuthStore();
	const [isSignUp, setIsSignUp] = useState(false);

	useEffect(() => {
		// 필요한 초기화 작업은 여기서
		if (user?.signalingId) {
			// ...
		}
	}, [user]);

	if (!isAuthenticated) {
		return (
			<>
				<GlobalStyle />
				<AppContainer>
					<Header>
						<h1>Handy</h1>
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
					<h1>Handy</h1>
					<button onClick={logout}>LogOut</button>
				</Header>
				<MainContent>
					{isPending && <CallPending />}
					{isReceiving && <IncomingCallModal />}
					{isInCall && <VideoCall />}
					{!isPending && !isInCall && !isReceiving && !isCalling && <FriendsList />}
				</MainContent>
			</AppContainer>
		</>
	);
};

export default App;
