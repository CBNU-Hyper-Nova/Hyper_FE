// src/components/Login.tsx
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
	background-color: ${theme.colors.primary};
	color: ${theme.colors.white};
	border: none;
	padding: 12px 40px;
	font-size: 18px;
	border-radius: 25px;
	cursor: pointer;
	margin-top: 20px;
	&:hover {
		background-color: #357abd;
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

interface LoginProps {
	toggleAuth: () => void;
}

const Login: React.FC<LoginProps> = ({ toggleAuth }) => {
	const { login } = useAuthStore();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	// 로그인 함수
	const handleLogin = async () => {
		await login(username, password);
	};

	return (
		<Container>
			<Title>로그인</Title>
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
			<Button onClick={handleLogin}>로그인</Button>
			<ToggleLink onClick={toggleAuth}>계정이 없으신가요? 회원가입</ToggleLink>
		</Container>
	);
};

export default Login;
