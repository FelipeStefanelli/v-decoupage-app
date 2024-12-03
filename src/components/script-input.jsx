import React, { useRef, useEffect } from 'react';

const ScriptInput = ({ value, onChange, placeholder, id, readOnly }) => {
    const textareaRef = useRef(null);

    const handleChange = (e) => {
        onChange(e.target.value);
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);

    return (
        <div
            style={{
                width: 'calc(100% - 18px)',
                height: 'auto',
                borderLeft: '1px solid rgb(158, 156, 168)',
                cursor: readOnly ? 'default' : 'text',
                display: 'flex',
                alignItems: 'center', // Garante que o span e textarea fiquem alinhados verticalmente
            }}
        >
            {readOnly ?
                <span
                    style={{
                        padding: '4px 8px', // Padding equivalente ao textarea
                        marginLeft: '8px', // Margin para alinhar com o textarea
                        lineHeight: '1.5', // Garante que o line-height seja consistente
                        whiteSpace: 'pre-wrap', // Para manter quebras de linha
                    }}
                >
                    {value}
                </span>
                :
                <textarea
                    id={id ? id : null}
                    ref={textareaRef}
                    value={value}
                    onChange={handleChange}
                    style={{
                        width: '100%',
                        marginLeft: '8px',
                        backgroundColor: 'transparent',
                        padding: '4px 8px',
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        overflow: 'hidden',
                        lineHeight: '1.5', // Garante o mesmo line-height no textarea
                    }}
                    rows={1}
                    placeholder={placeholder}
                />
            }
        </div>
    );
};

export default ScriptInput;
