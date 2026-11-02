import { useState, useRef, useEffect } from 'react';

/**
 * Reusable InfoTooltip Component
 * Displays an info (i) icon that pops up an informative explanation card on hover.
 */
export default function InfoTooltip({
    title,
    content,
    example,
    placement = 'top', // 'top' | 'bottom' | 'right' | 'left'
    width = '280px',
}) {
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef(null);

    return (
        <span
            className="position-relative d-inline-flex align-items-center ms-1 text-primary cursor-pointer"
            ref={containerRef}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsVisible(!isVisible);
            }}
            style={{ verticalAlign: 'middle', lineHeight: 1 }}
        >
            <i
                className="ri-information-line fs-14 text-info hover-text-primary transition-all"
                style={{ cursor: 'help' }}
            ></i>

            {/* Floating Info Card */}
            {isVisible && (
                <div
                    className="position-absolute shadow-lg border rounded-3 p-3 text-start bg-white"
                    style={{
                        zIndex: 1090,
                        width: width,
                        fontSize: '12px',
                        lineHeight: '1.45',
                        color: '#333',
                        pointerEvents: 'none',
                        ...(placement === 'top' && {
                            bottom: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            marginBottom: '8px',
                        }),
                        ...(placement === 'bottom' && {
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            marginTop: '8px',
                        }),
                        ...(placement === 'right' && {
                            top: '50%',
                            left: '100%',
                            transform: 'translateY(-50%)',
                            marginLeft: '8px',
                        }),
                        ...(placement === 'left' && {
                            top: '50%',
                            right: '100%',
                            transform: 'translateY(-50%)',
                            marginRight: '8px',
                        }),
                    }}
                >
                    {/* Header */}
                    <div className="d-flex align-items-center gap-1 fw-bold text-dark mb-1 pb-1 border-bottom">
                        <i className="ri-information-fill text-primary fs-14"></i>
                        <span>{title}</span>
                    </div>

                    {/* Content / Explanation */}
                    <p className="mb-2 text-muted fw-normal" style={{ fontSize: '11.5px' }}>
                        {content}
                    </p>

                    {/* Real-world Example Box */}
                    {example && (
                        <div className="bg-light p-2 rounded border border-light-subtle" style={{ fontSize: '11px' }}>
                            <strong className="text-primary d-block mb-1">
                                <i className="ri-lightbulb-line me-1"></i>Real Example:
                            </strong>
                            <span className="text-secondary">{example}</span>
                        </div>
                    )}
                </div>
            )}
        </span>
    );
}

