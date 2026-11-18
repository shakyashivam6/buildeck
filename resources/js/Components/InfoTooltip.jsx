import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Reusable InfoTooltip Component
 * Displays an info (i) icon that pops up an informative explanation card on hover.
 * Uses React Portal to avoid being clipped by overflow:hidden, table-responsive, or modals.
 * Supports both Light and Dark themes seamlessly.
 */
export default function InfoTooltip({
    title,
    content,
    example,
    placement = 'top', // 'top' | 'bottom' | 'right' | 'left'
    width = '280px',
}) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, placementActual: placement });
    const containerRef = useRef(null);

    const updatePosition = useCallback(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const tooltipWidth = parseInt(width, 10) || 280;
        const estimatedHeight = example ? 220 : 160;

        const spaceAbove = rect.top;
        const spaceBelow = window.innerHeight - rect.bottom;

        let actualPlacement = placement;
        // Flip between top/bottom based on available space
        if (placement === 'top' && spaceAbove < estimatedHeight && spaceBelow > spaceAbove) {
            actualPlacement = 'bottom';
        } else if (placement === 'bottom' && spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
            actualPlacement = 'top';
        }

        let top = 0;
        let left = rect.left + rect.width / 2 - tooltipWidth / 2;

        if (actualPlacement === 'top') {
            top = Math.max(10, rect.top - 8);
        } else if (actualPlacement === 'bottom') {
            top = rect.bottom + 8;
        } else if (actualPlacement === 'right') {
            top = rect.top + rect.height / 2;
            left = rect.right + 8;
        } else if (actualPlacement === 'left') {
            top = rect.top + rect.height / 2;
            left = rect.left - tooltipWidth - 8;
        }

        // Clamp horizontally within viewport
        if (left < 10) left = 10;
        if (left + tooltipWidth > window.innerWidth - 10) {
            left = window.innerWidth - tooltipWidth - 10;
        }

        setCoords({ top, left, placementActual: actualPlacement });
    }, [placement, width, example]);

    useEffect(() => {
        if (!isVisible) return;

        updatePosition();

        const handleScrollOrResize = () => {
            updatePosition();
        };

        // Capture scroll on any scrollable container (e.g. modal body)
        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);

        return () => {
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        };
    }, [isVisible, updatePosition]);

    return (
        <span
            className="d-inline-flex align-items-center ms-1 text-primary cursor-pointer"
            ref={containerRef}
            onMouseEnter={() => {
                updatePosition();
                setIsVisible(true);
            }}
            onMouseLeave={() => setIsVisible(false)}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isVisible) updatePosition();
                setIsVisible(!isVisible);
            }}
            style={{ verticalAlign: 'middle', lineHeight: 1 }}
        >
            <i
                className="ri-information-line fs-14 text-info hover-text-primary transition-all"
                style={{ cursor: 'help' }}
            ></i>

            {/* Floating Info Card via Portal (Never clipped by table-responsive or modals) */}
            {isVisible && typeof document !== 'undefined' && createPortal(
                <div
                    className="shadow-lg border rounded-3 p-3 text-start bg-body text-body"
                    style={{
                        position: 'fixed',
                        top: `${coords.top}px`,
                        left: `${coords.left}px`,
                        transform: coords.placementActual === 'top' ? 'translateY(-100%)' : 'none',
                        zIndex: 99999,
                        width: width,
                        fontSize: '12px',
                        lineHeight: '1.45',
                        pointerEvents: 'none',
                        whiteSpace: 'normal',
                        backgroundColor: 'var(--bs-body-bg, #ffffff)',
                        color: 'var(--bs-body-color, #212529)',
                        borderColor: 'var(--bs-border-color, #dee2e6)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    {/* Header */}
                    <div className="d-flex align-items-center gap-1 fw-bold text-body mb-1 pb-1 border-bottom">
                        <i className="ri-information-fill text-primary fs-14"></i>
                        <span>{title}</span>
                    </div>

                    {/* Content / Explanation */}
                    <p className="mb-2 text-secondary fw-normal" style={{ fontSize: '11.5px', whiteSpace: 'normal' }}>
                        {content}
                    </p>

                    {/* Real-world Example Box */}
                    {example && (
                        <div className="bg-body-secondary p-2 rounded border border-secondary-subtle" style={{ fontSize: '11px', whiteSpace: 'normal' }}>
                            <strong className="text-primary d-block mb-1">
                                <i className="ri-lightbulb-line me-1"></i>Real Example:
                            </strong>
                            <span className="text-body-secondary">{example}</span>
                        </div>
                    )}
                </div>,
                document.body
            )}
        </span>
    );
}
