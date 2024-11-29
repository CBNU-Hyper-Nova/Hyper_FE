// src/components/SignUp.tsx
import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import styled from "styled-components";
import { theme } from "../theme";

const Container = styled.div`
	background-color: ${theme.colors.white};
	padding: 40px;
	border-radius: 15px;
	max-width: 400px;
	margin: 100px auto;
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
	text-align: center;
`;

const Title = styled.h2`
	font-family: ${theme.fonts.secondary};
	margin-bottom: 30px;
`;

const Input = styled.input`
	width: 80%;
	padding: 12px;
	margin: 10px 0;
	border: 1px solid ${theme.colors.primary};
	border-radius: 5px;
	font-size: 16px;
`;

const Button = styled.button`
	background-color: ${theme.colors.accent};
	color: ${theme.colors.white};
	border: none;
	padding: 12px 40px;
	font-size: 18px;
	border-radius: 25px;
	cursor: pointer;
	margin-top: 20px;
	&:hover {
		background-color: #7a0fc0;
	}
`;

const ToggleLink = styled.p`
	margin-top: 20px;
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
		<Container>
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
			<Button onClick={handleSignUp}>회원가입</Button>
			<ToggleLink onClick={toggleAuth}>이미 계정이 있으신가요? 로그인</ToggleLink>
		</Container>
	);
};

export default SignUp;
