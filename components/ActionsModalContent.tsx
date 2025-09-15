import { Models } from "node-appwrite";
import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import { convertFileSize, formatDateTime } from "@/lib/utils";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const ImageThumbnail = ({ file }: { file: Models.Document }) => (
	<div className="file-details-thumbnail">
		<Thumbnail
			type={file.type}
			extension={file.name?.split(".").pop() || ""}
			url={file.url}
		/>
		<div className="flex flex-col">
			<p className="subtitle-2 mb-1">{file.name}</p>
			<FormattedDateTime date={file.$createdAt} className="caption" />
		</div>
	</div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
	<div className="flex">
		<p className="file-details-label text-left">{label}</p>
		<p className="file-details-value text-left">{value}</p>
	</div>
);

export const FileDetails = ({ file }: { file: Models.Document }) => {
	return (
		<>
			<ImageThumbnail file={file} />
			<div className="space-y-4 px-2 pt-2">
				<DetailRow
					label="Format:"
					value={file.name?.split(".").pop() || "Unknown"}
				/>
				<DetailRow label="Size:" value={convertFileSize(file.size)} />
				<DetailRow label="Uploaded:" value={formatDateTime(file.$createdAt)} />
				<DetailRow label="Last edit:" value={formatDateTime(file.$updatedAt)} />
			</div>
		</>
	);
};

interface Props {
	file: Models.Document;
	onInputChange: React.Dispatch<React.SetStateAction<string[]>>;
	onRemove: (email: string) => void;
	onShare: (emails: string[]) => void;
	onDelete: () => void;
	onRename: (newName: string) => void;
	inputEmails: string[];
	isLoading: boolean;
}

const ActionsModalContent = ({
	file,
	onInputChange,
	onRemove,
	onShare,
	onDelete,
	onRename,
	inputEmails,
	isLoading,
}: Props) => {
	const [newName, setNewName] = React.useState(file.name);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const emails = e.target.value.split(",").map((email) => email.trim());
		onInputChange(emails);
	};

	const handleRemove = (email: string) => {
		onRemove(email);
	};

	const handleShare = () => {
		onShare(inputEmails);
	};

	const handleRename = () => {
		if (newName !== file.name) {
			onRename(newName);
		}
	};

	return (
		<div className="actions-modal-content">
			<FileDetails file={file} />

			<div className="space-y-4">
				<div>
					<h3 className="h3">Share with</h3>
					<Input
						placeholder="Enter email addresses separated by commas"
						value={inputEmails.join(", ")}
						onChange={handleInputChange}
						className="shad-input"
					/>
				</div>

				{inputEmails.length > 0 && (
					<div className="space-y-2">
						{inputEmails.map((email, index) => (
							<div key={index} className="flex items-center justify-between">
								<span className="body-2">{email}</span>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => handleRemove(email)}
									className="text-red-500 hover:text-red-700"
								>
									Remove
								</Button>
							</div>
						))}
					</div>
				)}

				<div className="flex gap-2">
					<Button
						type="button"
						onClick={handleShare}
						disabled={isLoading || inputEmails.length === 0}
						className="flex-1"
					>
						{isLoading ? "Sharing..." : "Share"}
					</Button>
				</div>

				<div className="space-y-2">
					<h3 className="h3">Rename File</h3>
					<div className="flex gap-2">
						<Input
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							className="flex-1"
						/>
						<Button
							type="button"
							onClick={handleRename}
							disabled={newName === file.name}
						>
							Rename
						</Button>
					</div>
				</div>

				<div className="flex gap-2">
					<Button
						type="button"
						variant="destructive"
						onClick={onDelete}
						className="flex-1"
					>
						Delete File
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ActionsModalContent;
