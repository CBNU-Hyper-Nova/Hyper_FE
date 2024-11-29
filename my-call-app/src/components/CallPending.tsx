// src/components/CallPending.tsx
import React, { useEffect } from "react";
import { useCallStore } from "../store/callStore";
import styled from "styled-components";
import { theme } from "../theme";

const Container = styled.div`
	text-align: center;
	margin-top: 50px;
`;

const Message = styled.h2`
	font-family: ${theme.fonts.secondary};
	color: ${theme.colors.text};
`;

const CallPending: React.FC = () => {
	const { isCallPending } = useCallStore();

	useEffect(() => {
		// 테스트 환경에서 1초 후 통화 연결
		const timer = setTimeout(() => {
			// TODO: 실제 구현 시 주석 처리된 코드를 사용하세요.
			useCallStore.setState({ isCallPending: false, isInCall: true });

			// 실제 구현 시
			/*
      // 시그널링 서버를 통해 상대방에게 통화 요청을 보내고,
      // 상대방이 수락하면 isInCall을 true로 설정합니다.
      */
		}, 1000);

		return () => clearTimeout(timer);
	}, []);

	return (
		<Container>
			<Message>통화 대기 중...</Message>
		</Container>
	);
};

export default CallPending;
