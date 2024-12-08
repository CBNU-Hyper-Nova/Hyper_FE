// src/components/SignUp.tsx
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
	max-width: 400px;
	margin: ${theme.spacing.xl} auto;
	margin-top: 175px;
	box-shadow: ${theme.shadows.medium};
	text-align: center;

	@media (max-width: ${theme.breakpoints.mobile}) {
		padding: ${theme.spacing.md};
		margin: ${theme.spacing.lg} auto;
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
	width: 100%;
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

interface SignUpProps {
	toggleAuth: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ toggleAuth }) => {
	const { signUp } = useAuthStore();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	// 회원가입 함수
	const handleSignUp = async () => {
		await signUp(username, password);
	};

	return (
		<FormContainer>
			<Title>회원가입</Title>
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
			<Button onClick={handleSignUp} variant='secondary'>
				회원가입
			</Button>
			<ToggleLink onClick={toggleAuth}>이미 계정이 있으신가요? 로그인</ToggleLink>
		</FormContainer>
	);
};

export default SignUp;
