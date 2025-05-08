import React, { useState } from 'react';
import { getBezierPath, BaseEdge, EdgeLabelRenderer, Position } from 'reactflow';
import { Trash2 } from 'lucide-react';

interface CustomEdgeProps {
    id: string;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    sourcePosition: Position;
    targetPosition: Position;
    style?: React.CSSProperties;
    markerEnd?: string;
    data?: {
        label?: string;
        onDelete?: () => Promise<void>;
    };
}

const CustomEdge: React.FC<CustomEdgeProps> = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        try {
            await data?.onDelete?.();
            setError(null);
            setIsConfirmOpen(false);
        } catch (err) {
            setError('Не удалось удалить связь');
            setTimeout(() => setError(null), 3000);
            setIsConfirmOpen(false);
            console.error(`Failed to delete edge ${id}:`, err);
        }
    };

    return (
        <>
            {/* Линия ребра */}
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />

            {/* Кнопка удаления - круглая красная иконка на середине линии */}
            {data?.onDelete && (
                <foreignObject
                    x={(sourceX + targetX) / 2 - 10}
                    y={(sourceY + targetY) / 2 - 10}
                    width={20}
                    height={20}
                    style={{ overflow: 'visible', cursor: 'pointer', zIndex: 10 }}
                    tabIndex={0}
                    role="button"
                    aria-label="Удалить связь"
                    onClick={e => {
                        e.stopPropagation();
                        setIsConfirmOpen(true);
                    }}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setIsConfirmOpen(true);
                        }
                    }}
                >
                    <div
                        style={{
                            width: 20,
                            height: 20,
                            backgroundColor: '#dc2626',
                            borderRadius: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            boxShadow: '0 0 3px rgba(0,0,0,0.3)',
                        }}
                    >
                        <Trash2 size={14} />
                    </div>
                </foreignObject>
            )}

            {/* Рендеринг метки и модального окна */}
            <EdgeLabelRenderer>
                {/* Метка связи */}
                {data?.label && (
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            background: '#fff',
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontSize: 10,
                            border: '1px solid #ddd',
                            userSelect: 'none',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            zIndex: 5,
                        }}
                        className="nodrag nopan"
                    >
                        {data.label}
                    </div>
                )}

                {/* Модальное окно подтверждения удаления */}
                {isConfirmOpen && (
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2 + 110}px, ${(sourceY + targetY) / 2}px)`,
                            width: 200,
                            height: 120,
                            pointerEvents: 'auto',
                            zIndex: 9999, // High zIndex to ensure it's above all elements
                        }}
                        onClick={e => e.stopPropagation()}
                        className="nodrag nopan"
                    >
                        <div className="bg-white rounded-lg shadow-lg p-4 w-[200px] mx-auto">
                            <h3 className="text-sm font-semibold mb-2">Подтверждение удаления</h3>
                            <p className="text-xs mb-3">Удалить эту связь?</p>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="border border-gray-200 rounded-md text-gray-600 hover:bg-gray-200 py-1 px-3 text-xs"
                                    onClick={() => setIsConfirmOpen(false)}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="button"
                                    className="bg-red-100 rounded-md text-red-700 hover:bg-red-600 hover:text-white py-1 px-3 text-xs"
                                    onClick={handleDelete}
                                >
                                    Удалить
                                </button>
                            </div>
                            {error && (
                                <div className="mt-2 text-xs text-red-700 bg-red-100 p-1 rounded">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </EdgeLabelRenderer>
        </>
    );
};

export default CustomEdge;