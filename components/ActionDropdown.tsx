"use client";

import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import Image from "next/image";
import { Models } from "node-appwrite";
import { actionsDropdownItems } from "@/constants";
import Link from "next/link";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	deleteFile,
	renameFile,
	updateFileUsers,
} from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";
import { FileDetails } from "@/components/ActionsModalContent";
import ActionsModalContent from "@/components/ActionsModalContent";

const ActionDropdown = ({ file }: { file: Models.Document }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [action, setAction] = useState<ActionType | null>(null);
	const [name, setName] = useState(file.name);
	const [isLoading, setIsLoading] = useState(false);
	const [emails, setEmails] = useState<string[]>([]);

	const path = usePathname();

	const closeAllModals = () => {
		setIsModalOpen(false);
		setIsDropdownOpen(false);
		setAction(null);
		setName(file.name);
		setEmails([]);
	};

	const handleAction = (value: ActionType) => {
		setAction(value);
		setIsModalOpen(true);
		setIsDropdownOpen(false);
	};

	const handleDelete = async () => {
		setIsLoading(true);
		try {
			await deleteFile({
				fileId: file.$id,
				bucketFileId: file.bucketfield,
				path,
			});
			closeAllModals();
		} catch (error) {
			console.error("Failed to delete file:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleRename = async () => {
		if (name === file.name) return;

		setIsLoading(true);
		try {
			await renameFile({ fileId: file.$id, newName: name, path });
			closeAllModals();
		} catch (error) {
			console.error("Failed to rename file:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleShare = async () => {
		if (emails.length === 0) return;

		setIsLoading(true);
		try {
			await updateFileUsers({ fileId: file.$id, emails, path });
			closeAllModals();
		} catch (error) {
			console.error("Failed to share file:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleRemoveUser = (email: string) => {
		setEmails(emails.filter((e) => e !== email));
	};

	return (
		<>
			<DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<Image
							src="/assets/icons/more.svg"
							alt="more"
							width={24}
							height={24}
						/>
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuSeparator />

					{actionsDropdownItems.map((item) => (
						<DropdownMenuItem
							key={item.value}
							onClick={() => handleAction(item)}
							className="flex items-center gap-3"
						>
							<Image src={item.icon} alt={item.label} width={20} height={20} />
							<p className="body-2">{item.label}</p>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>

			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent className="max-w-[500px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-3">
							<Image
								src={action?.icon || ""}
								alt={action?.label || ""}
								width={24}
								height={24}
							/>
							{action?.label}
						</DialogTitle>
					</DialogHeader>

					{action?.value === "rename" && (
						<Input value={name} onChange={(e) => setName(e.target.value)} />
					)}
					{action?.value === "details" && <FileDetails file={file} />}
					{action?.value === "share" && (
						<div className="space-y-4">
							<div>
								<h3 className="h3">Share with</h3>
								<Input
									placeholder="Enter email addresses separated by commas"
									value={emails.join(", ")}
									onChange={(e) => {
										const emailList = e.target.value
											.split(",")
											.map((email) => email.trim());
										setEmails(emailList);
									}}
									className="shad-input"
								/>
							</div>
							{emails.length > 0 && (
								<div className="space-y-2">
									{emails.map((email, index) => (
										<div
											key={index}
											className="flex items-center justify-between"
										>
											<span className="body-2">{email}</span>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => handleRemoveUser(email)}
												className="text-red-500 hover:text-red-700"
											>
												Remove
											</Button>
										</div>
									))}
								</div>
							)}
						</div>
					)}
					{action?.value === "delete" && (
						<p className="delete-confirmation">
							Are you sure you want to delete{` `}
							<span className="delete-file-name">{file.name}</span>?
						</p>
					)}
				</DialogContent>
				{["rename", "delete", "share"].includes(action?.value || "") && (
					<DialogFooter className="flex flex-col gap-3 md:flex-row">
						<Button
							type="button"
							variant="outline"
							onClick={closeAllModals}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={
								action?.value === "rename"
									? handleRename
									: action?.value === "delete"
										? handleDelete
										: action?.value === "share"
											? handleShare
											: () => {}
							}
							disabled={isLoading}
							className="bg-red-500 hover:bg-red-600"
						>
							{isLoading ? "Processing..." : action?.label}
						</Button>
					</DialogFooter>
				)}
			</Dialog>
		</>
	);
};

export default ActionDropdown;
