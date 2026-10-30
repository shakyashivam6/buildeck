import { useState, useRef, useEffect } from 'react';

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
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef(null);
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

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
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
            className={`searchable-select position-relative ${disabled ? 'opacity-50' : ''}`}
            ref={dropdownRef}
        >
            {/* Display Box (Like Form Select) */}
            <div
                id={id}
                role="button"
                tabIndex={disabled ? -1 : 0}
                onClick={() => {
                    if (!disabled) setIsOpen(!isOpen);
                }}
                className={`form-control d-flex justify-content-between align-items-center select2-selection ${
                    error ? 'is-invalid border-danger' : ''
                } ${isOpen ? 'border-primary' : ''}`}
                style={{
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    userSelect: 'none',
                    minHeight: '38px',
                    backgroundColor: disabled ? '#f8f9fa' : '#fff',
                }}
            >
                <span className={selectedItem ? 'text-dark' : 'text-muted'}>
                    {selectedItem ? selectedItem[nameKey] : placeholder}
                </span>
                <i
                    className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-muted fs-16 ms-2`}
                ></i>
            </div>

            {/* Dropdown Menu with Search Box (Select2 Style) */}
            {isOpen && (
                <div
                    className="position-absolute start-0 end-0 bg-white border border-top-0 rounded-bottom shadow-lg"
                    style={{
                        zIndex: 1060,
                        top: '100%',
                        marginTop: '-1px',
                    }}
                >
                    {/* Search Input Box */}
                    <div className="p-2 border-bottom bg-light">
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-white border-end-0 text-muted">
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
                    <ul
                        className="list-unstyled mb-0"
                        style={{
                            maxHeight: '220px',
                            overflowY: 'auto',
                        }}
                    >
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => {
                                const isSelected =
                                    String(opt[valueKey]) === String(value);
                                return (
                                    <li
                                        key={opt[valueKey]}
                                        onClick={() => handleSelect(opt)}
                                        className={`px-3 py-2 cursor-pointer d-flex justify-content-between align-items-center select2-result ${
                                            isSelected
                                                ? 'bg-primary text-white fw-semibold'
                                                : 'text-dark hover-bg-light'
                                        }`}
                                        style={{
                                            cursor: 'pointer',
                                            fontSize: '13.5px',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.backgroundColor =
                                                    '#f1f5f7';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.backgroundColor =
                                                    'transparent';
                                            }
                                        }}
                                    >
                                        <span>{opt[nameKey]}</span>
                                        {isSelected && (
                                            <i className="ri-check-line ms-2"></i>
                                        )}
                                    </li>
                                );
                            })
                        ) : (
                            <li className="px-3 py-3 text-center text-muted fs-13">
                                <i className="ri-inbox-line d-block fs-18 mb-1"></i>
                                No results found
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

