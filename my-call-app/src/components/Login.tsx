// src/components/Login.tsx
import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import styled from "styled-components";
import { theme } from "../theme";
import BaseButton from "./common/BaseButton";
import Container from "./common/Container";

const FormContainer = styled.div`
	background-color: ${theme.colors.white};
	padding: ${theme.spacing.lg};
	border-radius: ${theme.radius.lg};
	width: 70%;
	max-width: 700px;
	height: 40vh;
	margin: ${theme.spacing.xl} auto;
	box-shadow: ${theme.shadows.medium};
	text-align: center;

	@media (max-width: ${theme.breakpoints.mobile}) {
		padding: ${theme.spacing.md};
		margin: ${theme.spacing.lg} auto;
	}
`;

const Title = styled.h2`
	font-family: ${theme.fonts.secondary};
	margin-bottom: 50px;
	font-size: 24px;

	@media (max-width: ${theme.breakpoints.mobile}) {
		font-size: 20px;
	}
`;

const Input = styled.input`
	width: 80%;
	padding: ${theme.spacing.sm};
	margin: ${theme.spacing.sm} 0;
	border: 1px solid ${theme.colors.primary};
	border-radius: ${theme.radius.sm};
	font-size: 16px;

	@media (max-width: ${theme.breakpoints.mobile}) {
		width: 100%;
		padding: ${theme.spacing.xs};
		font-size: 14px;
	}
`;

const Button = styled(BaseButton)`
	width: 70%;
	margin-top: ${theme.spacing.sm};
	padding: ${theme.spacing.sm};
	font-size: 18px;
	border-radius: ${theme.radius.round};

	@media (max-width: ${theme.breakpoints.mobile}) {
		font-size: 16px;
		padding: ${theme.spacing.xs};
	}
`;

const ToggleLink = styled.p`
	margin-top: ${theme.spacing.sm};
	color: ${theme.colors.text};
	cursor: pointer;
	&:hover {
		text-decoration: underline;
	}
`;

const ErrorMessage = styled.p`
	color: red;
	margin-top: ${theme.spacing.sm};
`;

interface LoginProps {
	toggleAuth: () => void;
}

const Login: React.FC<LoginProps> = ({ toggleAuth }) => {
	const { login, signup } = useAuthStore();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isSignup, setIsSignup] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// 로그인 또는 회원가입 함수
	const handleAuth = async () => {
		try {
			setError(null);
			if (isSignup) {
				await signup(username, password);
			} else {
				await login(username, password);
			}
		} catch (err: any) {
			setError(err.message);
		}
	};

	return (
		<FormContainer>
			<Title>{isSignup ? "회원가입" : "로그인"}</Title>
			<Input
				type='text'
				placeholder='아이디'
				value={username}
				onChange={(e) => setUsername(e.target.value)}
			/>
			<Input
				type='password'
				placeholder='비밀번호'
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			{error && <ErrorMessage>{error}</ErrorMessage>}
			<Button onClick={handleAuth} variant='primary'>
				{isSignup ? "회원가입" : "로그인"}
			</Button>
			<ToggleLink onClick={() => setIsSignup(!isSignup)}>
				{isSignup ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 회원가입"}
			</ToggleLink>
		</FormContainer>
	);
};

export default Login;
