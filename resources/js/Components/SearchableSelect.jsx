import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export default function SearchableSelect({
    options = [],
    value = '',
    onChange,
    placeholder = 'Select an option',
    disabled = false,
    error = '',
    id = '',
    nameKey = 'name',
    valueKey = 'id',
    size = '',
    className = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [coords, setCoords] = useState({ top: 0, left: 0, minWidth: 0, maxWidth: 360, placement: 'bottom' });
    const dropdownRef = useRef(null);
    const menuRef = useRef(null);
    const searchInputRef = useRef(null);

    // Selected item find karein
    const selectedItem = options.find(
        (opt) => String(opt[valueKey]) === String(value)
    );

    // Filter options based on search query
    const filteredOptions = options.filter((opt) => {
        const label = String(opt[nameKey] || '');
        return label.toLowerCase().includes(search.toLowerCase());
    });

    const updateCoords = useCallback(() => {
        if (!dropdownRef.current) return;
        const rect = dropdownRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const estimatedMenuHeight = 260;

        let placement = 'bottom';
        let top = rect.bottom + 2;

        if (spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow) {
            placement = 'top';
            top = Math.max(10, rect.top - 2);
        }

        const minWidth = Math.max(rect.width, 240);
        const maxWidth = Math.min(450, window.innerWidth - 20);
        let left = rect.left;

        if (left + minWidth > window.innerWidth - 10) {
            left = Math.max(10, window.innerWidth - minWidth - 10);
        }
        if (left < 10) left = 10;

        setCoords({
            top,
            left,
            minWidth,
            maxWidth,
            placement,
        });
    }, []);

    // Toggle menu
    const handleToggle = () => {
        if (disabled) return;
        if (!isOpen) {
            updateCoords();
        }
        setIsOpen(!isOpen);
    };

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            const isClickInsideTrigger = dropdownRef.current && dropdownRef.current.contains(event.target);
            const isClickInsideMenu = menuRef.current && menuRef.current.contains(event.target);

            if (!isClickInsideTrigger && !isClickInsideMenu) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Reposition on scroll (captured inside modals/tables) and window resize
    useEffect(() => {
        if (!isOpen) return;

        updateCoords();

        const handleScrollOrResize = () => {
            updateCoords();
        };

        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);

        return () => {
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        };
    }, [isOpen, updateCoords]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        } else {
            setSearch('');
        }
    }, [isOpen]);

    const handleSelect = (opt) => {
        if (onChange) {
            onChange(opt[valueKey]);
        }
        setIsOpen(false);
    };

    return (
        <div
            className={`searchable-select position-relative ${disabled ? 'opacity-50' : ''} ${className}`}
            ref={dropdownRef}
        >
            {/* Display Box: Inherits theme background and text from Bootstrap .form-control */}
            <div
                id={id}
                role="button"
                tabIndex={disabled ? -1 : 0}
                onClick={handleToggle}
                className={`form-control ${size === 'sm' ? 'form-control-sm' : ''} d-flex justify-content-between align-items-center ${
                    error ? 'is-invalid border-danger' : ''
                } ${isOpen ? 'border-primary' : ''}`}
                title={selectedItem ? selectedItem[nameKey] : ''}
                style={{
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    userSelect: 'none',
                    minHeight: size === 'sm' ? '31px' : '38px',
                }}
            >
                <span
                    className={`text-truncate ${selectedItem ? 'text-body' : 'text-muted'}`}
                    title={selectedItem ? selectedItem[nameKey] : ''}
                >
                    {selectedItem ? selectedItem[nameKey] : placeholder}
                </span>
                <i
                    className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-muted fs-16 ms-2 flex-shrink-0`}
                ></i>
            </div>

            {/* Dropdown Menu via Portal: Escapes all table-responsive and card boundaries */}
            {isOpen && typeof document !== 'undefined' && createPortal(
                <div
                    ref={menuRef}
                    className="dropdown-menu show p-0 shadow-lg border bg-body text-body"
                    style={{
                        zIndex: 99999,
                        position: 'fixed',
                        top: `${coords.top}px`,
                        left: `${coords.left}px`,
                        minWidth: `${coords.minWidth}px`,
                        maxWidth: `${coords.maxWidth}px`,
                        width: 'max-content',
                        transform: coords.placement === 'top' ? 'translateY(-100%)' : 'none',
                        backgroundColor: 'var(--bs-body-bg, #ffffff)',
                        color: 'var(--bs-body-color, #212529)',
                        borderColor: 'var(--bs-border-color, #dee2e6)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    {/* Search Input Box */}
                    <div className="p-2 border-bottom bg-body-tertiary">
                        <div className="input-group input-group-sm">
                            <span className="input-group-text border-end-0 text-muted">
                                <i className="ri-search-line"></i>
                            </span>
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="form-control form-control-sm border-start-0"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div
                        className="py-1"
                        style={{
                            maxHeight: '240px',
                            overflowY: 'auto',
                        }}
                    >
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt, idx) => {
                                const isSelected =
                                    String(opt[valueKey]) === String(value);
                                return (
                                    <button
                                        key={opt[valueKey] !== undefined && opt[valueKey] !== '' ? opt[valueKey] : `opt-${idx}`}
                                        type="button"
                                        onClick={() => handleSelect(opt)}
                                        className={`dropdown-item py-2 px-3 d-flex justify-content-between align-items-center ${
                                            isSelected ? 'active' : ''
                                        }`}
                                        style={{ fontSize: '13.5px' }}
                                        title={opt[nameKey]}
                                    >
                                        <span className="text-truncate me-2" title={opt[nameKey]}>
                                            {opt[nameKey]}
                                        </span>
                                        {isSelected && (
                                            <i className="ri-check-line ms-2 flex-shrink-0"></i>
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-3 py-3 text-center text-muted fs-13">
                                <i className="ri-inbox-line d-block fs-18 mb-1"></i>
                                No results found
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
