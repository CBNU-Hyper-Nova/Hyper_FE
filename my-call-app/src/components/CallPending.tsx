// src/components/CallPending.tsx
import React from "react";
import styled from "styled-components";
import { theme } from "../theme";
import { useCallStore } from "../store/callStore";

const PendingOverlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: ${theme.colors.modalOverlay};
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
`;

const PendingContent = styled.div`
	background-color: ${theme.colors.white};
	padding: ${theme.spacing.lg};
	border-radius: ${theme.radius.lg};
	text-align: center;
`;

const CallPending: React.FC = () => {
	const { isPending, selectedFriend } = useCallStore();

	if (!isPending || !selectedFriend) return null;

	return (
		<PendingOverlay>
			<PendingContent>
				<h2>{selectedFriend.name}님에게 통화 연결 중...</h2>
			</PendingContent>
		</PendingOverlay>
	);
};

export default CallPending;
