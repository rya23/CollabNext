'use client';

import React, { useState } from 'react';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Timestamp } from 'firebase/firestore';
import { useEditor } from '@tiptap/react';
import DiffMatchPatch from 'diff-match-patch';

interface Version {
    id: string;
    content: string;
    createdAt: Timestamp;
    name: string;
}

interface VersionHistoryProps {
    isOpen: boolean;
    onClose: () => void;
    versions: Version[];
    onRestore: (version: Version) => void;
    currentContent: string;
}

export default function VersionHistory({ isOpen, onClose, versions, onRestore, currentContent }: VersionHistoryProps) {
    const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
    const [showDiff, setShowDiff] = useState(false);
    const [confirmRestore, setConfirmRestore] = useState(false);

    const formatDate = (timestamp: Timestamp) => {
        return timestamp.toDate().toLocaleString();
    };

    const generateDiff = (oldContent: string, newContent: string) => {
        // Strip HTML tags for a simpler diff
        const stripHtml = (html: string) => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            return doc.body.textContent || '';
        };

        const dmp = new DiffMatchPatch();
        const diff = dmp.diff_main(stripHtml(oldContent), stripHtml(newContent));
        dmp.diff_cleanupSemantic(diff);

        return diff.map((part: [any, any], index: React.Key | null | undefined) => {
            const [type, text] = part;
            const className = type === -1 ? 'bg-red-200' : type === 1 ? 'bg-green-200' : '';
            return (
                <span key={index} className={className}>
                    {text}
                </span>
            );
        });
    };

    const handleRestore = (version: Version) => {
        setConfirmRestore(true);
        setSelectedVersion(version);
    };

    const confirmRestoreVersion = () => {
        if (selectedVersion) {
            onRestore(selectedVersion);
            setSelectedVersion(null);
            setConfirmRestore(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-4/5 max-w-4xl h-4/5 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold">Version History</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Versions List */}
                    <div className="w-1/3 border-r overflow-y-auto p-3">
                        {versions.length === 0 ? (
                            <div className="text-gray-500 italic p-4">No versions saved yet</div>
                        ) : (
                            versions.map((version) => (
                                <div
                                    key={version.id}
                                    className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
                                        selectedVersion?.id === version.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                    }`}
                                    onClick={() => setSelectedVersion(version)}
                                >
                                    <div className="font-medium">{version.name}</div>
                                    <div className="text-sm text-gray-500">{formatDate(version.createdAt)}</div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Version Preview */}
                    <div className="flex-1 overflow-y-auto flex flex-col">
                        {selectedVersion ? (
                            <>
                                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                                    <div>
                                        <h3 className="font-bold">{selectedVersion.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            Created on {formatDate(selectedVersion.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => setShowDiff(!showDiff)}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            {showDiff ? 'Show Content' : 'Show Changes'}
                                        </button>
                                        <button
                                            onClick={() => handleRestore(selectedVersion)}
                                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            <ArrowPathIcon className="w-4 h-4" />
                                            <span>Restore</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 p-4 overflow-y-auto">
                                    {showDiff ? (
                                        <div className="border p-4 rounded bg-gray-50">
                                            <h4 className="font-medium mb-2">Changes from current version:</h4>
                                            <div>{generateDiff(selectedVersion.content, currentContent)}</div>
                                        </div>
                                    ) : (
                                        <div
                                            className="prose max-w-none"
                                            dangerouslySetInnerHTML={{ __html: selectedVersion.content }}
                                        />
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                Select a version to preview
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Restore Confirmation Dialog */}
            {confirmRestore && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-xl font-bold mb-4">Confirm Restore</h3>
                        <p className="mb-6">
                            Are you sure you want to restore this version? Your current changes will be overwritten.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setConfirmRestore(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRestoreVersion}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Restore
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
