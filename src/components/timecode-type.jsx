import React from 'react';
import Image from "next/image";

const TimecodeType = ({ id, timecode, setActiveMenu, updateTimecode, activeMenu, readOnly }) => {
    const handleIdClick = (id) => {
        setActiveMenu((prev) => (prev === id ? null : id));
    };

    const handleOptionClick = (timecode, option) => {
        setActiveMenu(null);
        const updatedTimecode = { ...timecode, type: option };
        updateTimecode(updatedTimecode);
    };
    return (
        <div
            style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                height: "32px",
                margin: "6px 0",
                borderTop: "1px solid rgba(158, 156, 168, 1)",
                borderBottom: "1px solid rgba(158, 156, 168, 1)",
                borderRight: "1px solid rgba(158, 156, 168, 1)",
                borderTopRightRadius: activeMenu || !timecode.type ? "0" : "4px",
                borderBottomRightRadius: activeMenu || !timecode.type ? "0" : "4px",
                backgroundColor: timecode.type === "V" ? "rgba(221, 229, 236, 1)"
                    : timecode.type === "A" ? "rgba(207, 227, 227, 1)"
                        : timecode.type === "AV" ? "rgba(240, 223, 223, 1)"
                            : "white"

            }}
        >
            <p
                onClick={() => !readOnly && handleIdClick(timecode.id)}
                style={{
                    cursor: readOnly ? "text" : "pointer",
                    color: "rgba(158, 156, 168, 1)",
                    padding: "6px 8px",
                    fontSize: "18px",
                    lineHeight: "18px",
                    fontWeight: "800",
                    borderRight: timecode.type ? "1px solid rgba(158, 156, 168, 1)" : "",
                    userSelect: "none"
                }}
            >
                {id + 1}
            </p>
            {timecode.type && (
                <span>
                    {timecode.type === "V" ?
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                height: "32px",
                                padding: "6px",
                                cursor: readOnly ? "text" : "pointer",
                                userSelect: "none",
                            }}
                        >
                            <Image
                                aria-hidden
                                src="/V.svg"
                                alt="Vídeo icon"
                                width={19}
                                height={17}
                                style={{ width: "19px", height: "17px" }}
                            />
                        </div>
                        : timecode.type === "A" ?
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    height: "32px",
                                    padding: "6px",
                                    cursor: readOnly ? "text" : "pointer",
                                    userSelect: "none",
                                }}
                            >
                                <Image
                                    aria-hidden
                                    src="/A.svg"
                                    alt="Áudio icon"
                                    width={19}
                                    height={17}
                                    style={{ width: "19px", height: "17px" }}
                                />
                            </div>
                            : timecode.type === "AV" ?
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        height: "32px",
                                        padding: "6px",
                                        cursor: readOnly ? "text" : "pointer",
                                        userSelect: "none",
                                    }}
                                >
                                    <Image
                                        aria-hidden
                                        src="/AV.svg"
                                        alt="AV icon"
                                        width={19}
                                        height={17}
                                        style={{ width: "19px", height: "17px" }}
                                    />
                                </div>
                                :
                                null
                    }
                </span>
            )}
            {(activeMenu === timecode.id || !timecode.type) && !readOnly && (
                <div
                    style={{
                        position: "absolute",
                        left: "27px",
                        width: "96px",
                        display: "flex",
                        backgroundColor: "white"
                    }}
                >
                    <div
                        onClick={() => handleOptionClick(timecode, "V")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            height: "32px",
                            padding: "6px",
                            cursor: "pointer",
                            userSelect: "none",
                            borderTop: "1px solid rgba(158, 156, 168, 1)",
                            borderBottom: "1px solid rgba(158, 156, 168, 1)",
                            borderRight: "1px solid rgba(158, 156, 168, 1)",
                        }}
                    >
                        <Image
                            aria-hidden
                            src="/V.svg"
                            alt="Vídeo icon"
                            width={19}
                            height={17}
                            style={{ width: "19px", height: "17px" }}
                        />
                    </div>
                    <div
                        onClick={() => handleOptionClick(timecode, "A")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            height: "32px",
                            padding: "6px",
                            cursor: "pointer",
                            userSelect: "none",
                            borderTop: "1px solid rgba(158, 156, 168, 1)",
                            borderBottom: "1px solid rgba(158, 156, 168, 1)",
                            borderRight: "1px solid rgba(158, 156, 168, 1)",
                        }}
                    >
                        <Image
                            aria-hidden
                            src="/A.svg"
                            alt="Áudio icon"
                            width={19}
                            height={17}
                            style={{ width: "19px", height: "17px" }}
                        />
                    </div>
                    <div
                        onClick={() => handleOptionClick(timecode, "AV")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            height: "32px",
                            padding: "6px",
                            cursor: "pointer",
                            userSelect: "none",
                            borderTop: "1px solid rgba(158, 156, 168, 1)",
                            borderBottom: "1px solid rgba(158, 156, 168, 1)",
                            borderRight: "1px solid rgba(158, 156, 168, 1)",
                            borderTopRightRadius: "4px",
                            borderBottomRightRadius: "4px",
                        }}
                    >
                        <Image
                            aria-hidden
                            src="/AV.svg"
                            alt="AV icon"
                            width={19}
                            height={17}
                            style={{ width: "19px", height: "17px" }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimecodeType;


