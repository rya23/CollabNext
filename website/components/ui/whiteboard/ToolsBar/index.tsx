import React from 'react';
import PencilButton from './PencilButton';
import RectangleButton from './RectangleButton';
import EllipseButton from './EllipseButton';
import UndoButton from './UndoButton';
import RedoButton from './RedoButton';
import SelectionButton from './SelectionButton';
import IconButton from '../IconButton';
import { CanvasMode, LayerType, CanvasState } from '../types';
import styles from './index.module.css';

type Props = {
    canvasState: CanvasState;
    setCanvasState: (newState: CanvasState) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onSave?: () => void;
};

export default function ToolsBar({ canvasState, setCanvasState, undo, redo, canUndo, canRedo, onSave }: Props) {
    return (
        <div className={styles.tools_panel_container}>
            <div className={styles.tools_panel}>
                <div className={styles.tools_panel_section}>
                    <SelectionButton
                        isActive={
                            canvasState.mode === CanvasMode.None ||
                            canvasState.mode === CanvasMode.Translating ||
                            canvasState.mode === CanvasMode.SelectionNet ||
                            canvasState.mode === CanvasMode.Pressing ||
                            canvasState.mode === CanvasMode.Resizing
                        }
                        onClick={() => setCanvasState({ mode: CanvasMode.None })}
                    />
                    <PencilButton
                        isActive={canvasState.mode === CanvasMode.Pencil}
                        onClick={() => setCanvasState({ mode: CanvasMode.Pencil })}
                    />
                    <RectangleButton
                        isActive={
                            canvasState.mode === CanvasMode.Inserting &&
                            canvasState.layerType === LayerType.Rectangle
                        }
                        onClick={() =>
                            setCanvasState({
                                mode: CanvasMode.Inserting,
                                layerType: LayerType.Rectangle,
                            })
                        }
                    />
                    <EllipseButton
                        isActive={
                            canvasState.mode === CanvasMode.Inserting &&
                            canvasState.layerType === LayerType.Ellipse
                        }
                        onClick={() =>
                            setCanvasState({
                                mode: CanvasMode.Inserting,
                                layerType: LayerType.Ellipse,
                            })
                        }
                    />
                </div>
                <div className={styles.seperator}></div>
                <div className={styles.tools_panel_section}>
                    <UndoButton onClick={undo} disabled={!canUndo} />
                    <RedoButton onClick={redo} disabled={!canRedo} />
                </div>
                <div className={styles.seperator}></div>
                <div className={styles.tools_panel_section}>
                    <IconButton onClick={onSave}>
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M27 26H9V16H11V24H25V16H27V26ZM18 20L12 14L13.4 12.6L17 16.2V4H19V16.2L22.6 12.6L24 14L18 20Z"
                                fill="currentColor"
                            />
                        </svg>
                    </IconButton>
                </div>
            </div>
        </div>
    );
}
