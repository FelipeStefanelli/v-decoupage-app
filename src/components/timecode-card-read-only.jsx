import React from 'react';
import { formatTimecode } from "@/utils/utils";
import TimecodeInput from "./timecode-input";
import TimecodeType from "./timecode-type";
import ReactStars from "react-stars";

const TimecodeCard = ({ id, timecode, type, views = [], cardType = 'timecode' }) => {

    const verifyViews = (field) => {
        if (cardType === 'script' && views[field] === 'show') return true;
        if (cardType === 'timecode') return true;
        return false;
    }

    return (
        <div
            id="card"
            style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "white",
                borderRadius: "6px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                //maxWidth: "calc(50% - 8px)"
            }}
        >
            {timecode.imageUrl && type !== 'A' && type !== 'AV-audio' && (
                <img
                    src={timecode.imageUrl}
                    alt={`Thumbnail at ${timecode.inTime}`}
                    style={{
                        width: "100%",
                        borderTopRightRadius: "6px",
                        borderTopLeftRadius: "6px",
                        userSelect: 'none'
                    }}
                />
            )}
            <div
                style={type !== 'A' ?
                    {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingRight: "12px",
                        margin: "4px 0 12px 0",
                    }
                    :
                    {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingRight: "12px",
                        margin: "6px 0 16px 0",
                    }

                }
            >
                <TimecodeType
                    id={id}
                    timecode={timecode}
                    updateTimecode={null}
                    setActiveMenu={null}
                    activeMenu={null}
                    readOnly
                />
                {type !== 'AV-audio' && verifyViews('classification-view') &&
                    <ReactStars
                        value={timecode.rating}
                        count={3}
                        size={27}
                        color1={"#b4b4b4"}
                        color2={"#ffd700"}
                        edit={false}
                    />
                }
            </div>
            {timecode.text &&
                <TimecodeInput timecode={timecode} updateTimecode={null} readOnly />
            }
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', padding: '0 12px 0 0' }}>
                <p
                    style={{
                        borderRadius: '2px',
                        padding: '2px',
                        color: 'rgb(18, 14, 35)',
                        fontSize: '12px',
                        fontWeight: '600',
                        lineHeight: '10px',
                        letterSpacing: '0.1px',
                        textAlign: 'center',
                    }}
                >
                    {formatTimecode(timecode.inTime)}
                </p>
                ·
                <p
                    style={{
                        borderRadius: '2px',
                        padding: '2px',
                        color: 'rgb(18, 14, 35)',
                        fontSize: '12px',
                        fontWeight: '600',
                        lineHeight: '10px',
                        letterSpacing: '0.1px',
                        textAlign: 'center',
                    }}
                >
                    {formatTimecode(timecode.outTime)}
                </p>
                ·
                <p
                    style={{
                        borderRadius: '2px',
                        padding: '2px',
                        backgroundColor: 'rgb(18, 14, 35)',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '600',
                        lineHeight: '10px',
                        letterSpacing: '0.1px',
                        textAlign: 'center',
                    }}
                >
                    {formatTimecode(timecode.duration)}
                </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gap: '8px', padding: "8px 12px 16px 12px" }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', width: 'calc(100% - 32px)' }}>
                    <p
                        style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            lineHeight: '12px',
                            letterSpacing: '0.1px',
                            textAlign: 'end',
                        }}
                    >
                        {timecode.videoName}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TimecodeCard;
