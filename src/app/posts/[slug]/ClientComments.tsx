"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "firebaseConfig";
import Comments from "@/components/Comments";

interface ClientCommentsProps {
	postSlug: string;
}

const ClientComments: React.FC<ClientCommentsProps> = ({ postSlug }) => {
	const [currentUser, setCurrentUser] = useState<string | null>(null);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				const storedDisplayName = localStorage.getItem("displayName");
				const displayName =
					storedDisplayName || user.displayName || `User${user.uid.slice(-4)}`;
				setCurrentUser(displayName);
				localStorage.setItem("displayName", displayName);
			} else {
				setCurrentUser(null);
				localStorage.removeItem("displayName");
			}
		});

		return () => unsubscribe();
	}, []);

	return <Comments postSlug={postSlug} />;
};

export default ClientComments;
