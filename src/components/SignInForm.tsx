import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { RiTwitterXLine } from "react-icons/ri";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import {
	GoogleAuthProvider,
	GithubAuthProvider,
	TwitterAuthProvider,
	signInAnonymously,
	signInWithPopup,
	User,
} from "firebase/auth";
import { auth } from "firebaseConfig";

interface SignInFormProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onSignIn: (username: string, provider: string) => void;
}

export default function SignInForm({
	isOpen,
	onOpenChange,
	onSignIn,
}: SignInFormProps) {
	const [username, setUsername] = useState<string>("");
	const [error, setError] = useState<string>("");

	const handleAnonymousSignIn = async () => {
		try {
			const result = await signInAnonymously(auth);
			const user = result.user;
			const displayName =
				username.trim() || `Anonymous User ${user.uid.slice(-4)}`;
			localStorage.setItem("displayName", displayName);
			onSignIn(displayName, "anonymous");
			onOpenChange(false);
		} catch (error) {
			console.error("Error signing in anonymously:", error);
			setError("Failed to sign in anonymously");
		}
	};

	const handleProviderSignIn = async (providerName: string) => {
		let provider;

		switch (providerName) {
			case "google":
				provider = new GoogleAuthProvider();
				break;
			case "github":
				provider = new GithubAuthProvider();
				break;
			case "twitter":
				provider = new TwitterAuthProvider();
				break;
			default:
				console.log(`Unknown provider: ${providerName}`);
				return;
		}

		try {
			const result = await signInWithPopup(auth, provider);
			const user = result.user;
			const userProfileName = getUsername(user, providerName);

			if (userProfileName) {
				const displayName = username.trim() || userProfileName;
				localStorage.setItem("displayName", displayName);
				console.log(
					`Successfully signed in with ${providerName} as ${displayName}`
				);
				onSignIn(displayName, providerName);
				onOpenChange(false);
			} else {
				setError(
					"Unable to retrieve the username, cannot proceed with sign-in"
				);
				console.error(
					"Unable to retrieve the username, cannot proceed with sign-in"
				);
			}
		} catch (error) {
			setError("Sign-in failed. Please try again.");
			if (error instanceof Error) {
				console.error(`Error signing in with ${providerName}:`, error.message);
			} else {
				console.error("An unexpected error occurred");
			}
		}
	};

	const getUsername = (user: User, providerName: string): string | null => {
		switch (providerName) {
			case "google":
				return user.displayName || user.email || null;
			case "github":
				return user.displayName || user.email || null;
			case "twitter":
				return user.displayName || user.email || null;
			default:
				return null;
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 w-full max-w-[90vw] sm:max-w-sm mx-auto p-3 sm:p-6">
				<DialogHeader>
					<DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
						Sign In to Comment
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
					<Input
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						placeholder="Your public display name (optional)"
						className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 text-sm sm:text-base"
						aria-label="Your public display name (optional)"
					/>
					{error && (
						<p
							className="text-xs sm:text-sm text-red-600 dark:text-red-400"
							role="alert"
						>
							{error}
						</p>
					)}
					<Button
						onClick={handleAnonymousSignIn}
						className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors duration-200 text-sm sm:text-base py-1 sm:py-2"
					>
						Comment Anonymously
					</Button>
					<div className="relative my-4 sm:my-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
						</div>
						<div className="relative flex justify-center text-xs sm:text-sm">
							<span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
								Or continue with
							</span>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-2 sm:gap-3">
						<Button
							onClick={() => handleProviderSignIn("twitter")}
							className="w-full aspect-square bg-[#000000] hover:bg-[#000000]/90 dark:hover:bg-[#000000]/80 text-white transition-colors flex items-center justify-center p-1 sm:p-2"
							aria-label="Sign in with Twitter"
						>
							<RiTwitterXLine className="h-4 w-4 sm:h-5 sm:w-5" />
						</Button>
						<Button
							onClick={() => handleProviderSignIn("github")}
							className="w-full aspect-square bg-[#24292e] hover:bg-[#24292e]/90 dark:hover:bg-[#24292e]/80 text-white transition-colors flex items-center justify-center p-1 sm:p-2"
							aria-label="Sign in with GitHub"
						>
							<GitHubLogoIcon className="h-4 w-4 sm:h-5 sm:w-5" />
						</Button>
						<Button
							onClick={() => handleProviderSignIn("google")}
							className="w-full aspect-square bg-white hover:bg-gray-100 dark:hover:bg-gray-200 dark:hover:bg-opacity-95 text-gray-900 border border-gray-300 transition-colors flex items-center justify-center p-1 sm:p-2"
							aria-label="Sign in with Google"
						>
							<svg
								className="h-4 w-4 sm:h-5 sm:w-5"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									fill="#4285F4"
								/>
								<path
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									fill="#34A853"
								/>
								<path
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									fill="#FBBC05"
								/>
								<path
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									fill="#EA4335"
								/>
								<path d="M1 1h22v22H1z" fill="none" />
							</svg>
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
