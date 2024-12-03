import React, { useRef, useEffect } from 'react';

const TimecodeInput = ({ timecode, updateTimecode, readOnly = false }) => {
    const textareaRef = useRef(null);

    const handleChange = (e) => {
        let newValue = e.target.value;

        updateTimecode({ ...timecode, text: newValue });
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [timecode.text]);

    const handleDivClick = () => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    return (
        <div
            onClick={handleDivClick}
            style={{
                width: 'calc(100% - 24px)',
                height: 'auto',
                display: 'flex',
                alignItems: 'center',
                margin: '0px 12px 12px 12px',
                padding: '6px',
                borderRadius: '6px',
                borderLeft: timecode.type === 'V' ? '3px solid rgb(0, 40, 77)'
                    : timecode.type === 'A' ? '3px solid rgb(44, 146, 128)'
                        : timecode.type === 'AV' ? '3px solid rgb(146, 44, 44)'
                            : '0px solid rgb(0, 40, 77)',
                backgroundColor: 'rgb(231, 231, 231)',
                flexGrow: 1,
                cursor: readOnly ? '' : 'text'
            }}
        >
            {readOnly ?
                <span style={{
                    marginLeft: '8px',
                    padding: '4px 8px 4px 0px',
                }}>
                    {timecode.text}
                </span>
                :
                <textarea
                    ref={textareaRef}
                    value={timecode.text}
                    onChange={handleChange}
                    style={{
                        width: '100%',
                        marginLeft: '8px',
                        backgroundColor: 'rgb(231, 231, 231)',
                        padding: '4px 8px 4px 0px',
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        overflow: 'hidden',
                    }}
                    rows={1}
                />
            }
        </div>
    );
};

export default TimecodeInput;
