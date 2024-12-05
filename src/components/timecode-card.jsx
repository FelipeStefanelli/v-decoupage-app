import React from 'react';
import { formatTimecode } from "@/utils/utils";
import Image from "next/image";
import TimecodeInput from "./timecode-input";
import TimecodeType from "./timecode-type";
import ReactStars from "react-stars";

const TimecodeCard = ({ id, timecode, updateTimecode, setActiveMenu, activeMenu, ratingChanged, type, views, cardType }) => {
    const deleteTimecode = async (id) => {
        const response = await fetch('/api', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        });
        const data = await response.json();
        console.log(data)
    };

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
            }}
        >
            {timecode.imageUrl && type !== 'audio' && type !== 'AV-audio' && (
                <div style={{ position: 'relative', width: '100%' }}>
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
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}></div>
                </div>
            )}
            <div
                style={type !== 'audio' ?
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
                    updateTimecode={updateTimecode}
                    setActiveMenu={setActiveMenu}
                    activeMenu={activeMenu}
                    readOnly={type === 'AV-audio' ? true : false}
                />
                {type !== 'AV-audio' && verifyViews('classification-view') &&
                    <ReactStars
                        value={timecode.rating}
                        count={3}
                        onChange={(newRating) => ratingChanged(timecode, newRating)}
                        size={27}
                        color1={"#b4b4b4"}
                        color2={"#ffd700"}
                    />
                }
            </div>
            {type !== 'AV' &&
                <TimecodeInput timecode={timecode} updateTimecode={updateTimecode} />
            }
            {type !== 'AV-audio' &&
                <>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', padding: '0px 12px 0 0' }}>
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
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', padding: "12px 12px 16px 12px" }}>
                        <Image
                            aria-hidden
                            src="/trash.svg"
                            alt="Trash icon"
                            width={24}
                            height={24}
                            style={{ width: "24px", height: "24px", cursor: "pointer" }}
                            onClick={() => deleteTimecode(timecode.id)}
                        />
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
                </>
            }
        </div>
    );
};

export default TimecodeCard;
