'use client'
import { useEffect, useState } from "react";
import Image from "next/image";
import TimecodeCard from "./timecode-card";
import ScriptInput from "./script-input";
import io from "socket.io-client";

const socket = io();

const TimecodesSection = (props) => {
    const [activeMenu, setActiveMenu] = useState(null);
    const [timecodes, setTimecodes] = useState([]);
    const [scripts, setScripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [draggedTimecode, setDraggedTimecode] = useState(null);
    const [draggedTimecodeIndex, setDraggedTimecodeIndex] = useState(null);
    const [draggedTimecodeScriptIndex, setDraggedTimecodeScriptIndex] = useState(null);

    useEffect(() => {
        socket.on("updateTimecodes", (data) => {
            setTimecodes(data.timecodes);
            setScripts(data.script);
        });

        return () => {
            socket.off("dataUpdated");
        };
    }, []);

    useEffect(() => {
        fetchTimecodes();
    }, []);

    const fetchTimecodes = async () => {
        setLoading(true);
        const response = await fetch("/api");
        const data = await response.json();
        if (data) {
            data?.timecodes && setTimecodes(data.timecodes);
            data?.script && setScripts(data.script);
        } else {
            console.error(data.error);
        }
        setLoading(false);
    };

    const updateTimecode = async (updatedTimecode, scope = "timecodes", script = null) => {
        var requestBody = {
            scope: scope,
            timecode: updatedTimecode,
            script: script
        };
        try {
            await fetch("/api/", {
                method: "PUT",
                body: JSON.stringify(requestBody),
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Erro ao atualizar o timecode:", error);
        }
    };

    const updateJson = async (updatedTimecodes, updatedScript) => {
        var requestBody = {
            scope: 'timecode-move',
            json: {
                timecodes: updatedTimecodes,
                script: updatedScript
            }
        };
        try {
            await fetch("/api/", {
                method: "PUT",
                body: JSON.stringify(requestBody),
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Erro ao atualizar o timecode:", error);
        }
    };

    const ratingChanged = (timecode, newRating, scope) => {
        const scopeProv = scope ?? 'timecodes'
        const updatedTimecode = { ...timecode, rating: newRating };
        updateTimecode(updatedTimecode, scopeProv);
    };

    const sceneChange = (script, field, isValueChange, value) => {
        if (isValueChange) {
            script[field] = value;
            updateTimecode(null, 'script', script);
        } else {
            const hasField = script.activeFields.includes(field);
            if (hasField) {
                script.activeFields = script.activeFields.filter(item => item !== field)
            } else {
                script.activeFields.push(field);
            }
        }
        updateTimecode(null, 'script', script);
    };

    const toggleDropdown = (id) => {
        setDropdownOpen(dropdownOpen === id ? null : id);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleDragStart = (e, timecode, timecodeId, type, scriptId) => {
        setDraggedTimecode(timecode);
        if (type === 'timecode') {
            setDraggedTimecodeIndex(timecodeId);
        } else if (type === 'script') {
            setDraggedTimecodeScriptIndex({
                timecodeId,
                scriptId
            });
        }
        e.currentTarget.style.opacity = "0.4";
    };

    const handleDragEnd = (e) => {
        setDraggedTimecodeIndex(null);
        setDraggedTimecodeScriptIndex(null);
        setDraggedTimecode(null);
        e.currentTarget.style.opacity = "1";
    };

    const handleDrop = (e, droppedIndex = null) => {
        if (!draggedTimecode || droppedIndex === null) return;

        var timecodesProv;
        var scriptProv;
        const dropTargetId = e.currentTarget.id;
        const originDestination = getOriginDestination(draggedTimecodeIndex, draggedTimecodeScriptIndex, dropTargetId, droppedIndex);

        if (originDestination.origin === 'timecodes' && originDestination.destination === 'timecodes') {
            const reorderedTimecodes = Array.from(timecodes);
            const [removed] = reorderedTimecodes.splice(originDestination.originId, 1);
            reorderedTimecodes.splice(originDestination.destinationId, 0, removed);
            timecodesProv = reorderedTimecodes;
            scriptProv = Array.from(scripts);
            setScripts(scriptProv);
            setTimecodes(reorderedTimecodes);
        }
        else if (originDestination.origin === 'timecodes' && originDestination.destination === 'script') {
            const copyTimecodes = Array.from(timecodes);
            const copyScripts = Array.from(scripts);
            const [removed] = copyTimecodes.splice(originDestination.originId, 1);
            var updatedTimecodes = timecodes.filter((tc, i) => i !== originDestination.originId);

            copyScripts.map((script, i) => {
                if (i === originDestination.destinationId) {
                    script.timecodes.push(removed);
                }
            });
            timecodesProv = updatedTimecodes;
            scriptProv = copyScripts;
            setScripts(copyScripts);
            setTimecodes(updatedTimecodes);
        }
        else if (originDestination.origin === 'script' && originDestination.destination === 'timecodes') {
            const copyScripts = Array.from(scripts);
            const copyTimecodes = Array.from(timecodes);

            const scriptOrigin = copyScripts.find((script, i) => i === originDestination.originScriptId);
            if (!scriptOrigin) return;

            const [removedTimecode] = scriptOrigin.timecodes.splice(originDestination.originId, 1);

            copyTimecodes.splice(originDestination.destinationId, 0, removedTimecode);

            timecodesProv = copyTimecodes;
            scriptProv = copyScripts;
            setScripts(copyScripts);
            setTimecodes(copyTimecodes);
        }
        else if (originDestination.origin === 'script' && originDestination.destination === 'script') {
            const copyScripts = Array.from(scripts);
            const copyTimecodes = Array.from(timecodes);

            const scriptOrigin = copyScripts.find((script, i) => i === originDestination.originScriptId);
            if (!scriptOrigin) return;

            const [removedTimecode] = scriptOrigin.timecodes.splice(originDestination.originId, 1);

            const scriptDestination = copyScripts.find((script, i) => i === originDestination.destinationId);
            if (!scriptDestination) return;

            scriptDestination.timecodes.splice(originDestination.destinationId, 0, removedTimecode);
            timecodesProv = copyTimecodes;
            scriptProv = copyScripts;
            setScripts(copyScripts);
            setTimecodes(copyTimecodes);
        }

        updateJson(timecodesProv, scriptProv);
    };

    const getOriginDestination = (draggedTimecodeIndex, draggedTimecodeScriptIndex, dropTargetId, index) => {
        let originDestination = {
            origin: '',
            originId: '',
            originScriptId: '',
            destination: '',
            destinationId: '',
            destinationScriptId: ''
        };
        if (draggedTimecodeIndex !== null) {
            originDestination.origin = 'timecodes';
            originDestination.originId = draggedTimecodeIndex;
        } else if (draggedTimecodeScriptIndex !== null) {
            originDestination.origin = 'script';
            originDestination.originId = draggedTimecodeScriptIndex.timecodeId;
            originDestination.originScriptId = draggedTimecodeScriptIndex.scriptId;
        }
        if (dropTargetId === 'timecode-list') {
            originDestination.destination = 'timecodes';
            originDestination.destinationId = index;
        } else if (dropTargetId === 'script-list') {
            originDestination.destination = 'script';
            originDestination.destinationId = index;
        }
        return originDestination;
    }

    return (
        <div style={{ backgroundColor: "rgba(231, 231, 231)" }} className="flex-1">
            {loading ? (
                <div className="flex justify-center w-full">
                    <Image
                        aria-hidden
                        src="/loading.svg"
                        alt="Loading Icon"
                        width={72}
                        height={72}
                        style={{ width: "72px", height: "72px" }}
                        priority
                    />
                </div>
            ) : (
                <div style={{ display: "flex" }}>
                    {timecodes.length === 0 ? (
                        <div
                            id={`timecode-empty-list`}
                            style={{
                                flex: "1",
                                padding: "16px"
                            }}
                        >
                            Nenhum timecode disponível
                        </div>
                    ) : (
                        <ul
                            style={{
                                display: "grid",
                                gridTemplateColumns: props.script ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
                                gap: "16px",
                                flex: "1",
                                alignSelf: "start",
                                padding: "16px"
                            }}
                        >
                            {timecodes.map((timecode, index) => (
                                <li
                                    key={timecode.id}
                                    id={`timecode-list`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, timecode, index, 'timecode')}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index)}
                                    style={{ cursor: 'move' }}
                                >
                                    <TimecodeCard
                                        id={index}
                                        timecode={timecode}
                                        updateTimecode={updateTimecode}
                                        setActiveMenu={setActiveMenu}
                                        activeMenu={activeMenu}
                                        ratingChanged={ratingChanged}
                                        type="timecode"
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                    {props.script &&
                        <div
                            style={{
                                width: '60%',
                                backgroundColor: "rgb(242,242,242)"
                            }}
                        >
                            {scripts.length === 0 ? (
                                <p style={{ padding: "16px" }}>Nenhum script disponivel</p>
                            ) : (
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '16px',
                                        padding: '16px',
                                    }}
                                >
                                    {scripts.map((script, id) => (
                                        <div key={id} style={{ border: '1px solid #b4b4b4' }}>
                                            <div style={{ display: "flex", justifyContent: 'space-between', backgroundColor: 'rgb(231, 231, 231)', padding: '12px' }}>
                                                <p style={{ fontSize: "18px" }}>{script.name}</p>
                                                <div style={{ display: "flex", gap: '16px', fontSize: "18px", position: 'relative' }}>
                                                    <Image
                                                        aria-hidden
                                                        src="/pen.svg"
                                                        alt="Pen Icon"
                                                        width={24}
                                                        height={24}
                                                        style={{ width: "24px", height: "24px", cursor: 'pointer' }}
                                                        priority
                                                        onClick={() => toggleDropdown(id)}
                                                    />
                                                    <Image
                                                        aria-hidden
                                                        src="/trash.svg"
                                                        alt="Delete Icon"
                                                        width={24}
                                                        height={24}
                                                        style={{ width: "24px", height: "24px", cursor: 'pointer' }}
                                                        priority
                                                    />
                                                    {dropdownOpen === id && (
                                                        <div style={{
                                                            width: '160px',
                                                            position: 'absolute',
                                                            top: '36px',
                                                            right: '0',
                                                            backgroundColor: 'white',
                                                            border: '1px solid #ccc',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                                            zIndex: '10',
                                                        }}>
                                                            <div
                                                                onClick={() => sceneChange(script, 'description', false)}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 16px 10px 16px', cursor: 'pointer', background: 'rgba(121, 116, 126, 0.1)' }}
                                                            >
                                                                <Image src="/description.svg" alt="Descrição" width={22} height={22} style={{ width: "22px", height: "22px" }} />
                                                                <span style={{ fontSize: '16px' }}>Descrição</span>
                                                            </div>
                                                            <div
                                                                onClick={() => sceneChange(script, 'takes', false)}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', background: 'rgba(121, 116, 126, 0.1)' }}
                                                            >
                                                                <Image src={script.activeFields.includes('takes') ? "/V.svg" : "/blue-V.svg"} alt="Takes" width={22} height={22} style={{ width: "22px", height: "22px" }} />
                                                                <span style={{ fontSize: '16px' }}>Takes</span>
                                                            </div>
                                                            <div
                                                                onClick={() => sceneChange(script, 'audio', false)}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', background: 'rgba(121, 116, 126, 0.1)' }}
                                                            >
                                                                <Image src={script.activeFields.includes('audio') ? "/A.svg" : "/blue-A.svg"} alt="Áudio" width={22} height={22} style={{ width: "22px", height: "22px" }} />
                                                                <span style={{ fontSize: '16px' }}>Áudio</span>
                                                            </div>
                                                            <div
                                                                onClick={() => sceneChange(script, 'locution', false)}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px 16px 16px', cursor: 'pointer', background: 'rgba(121, 116, 126, 0.1)' }}
                                                            >
                                                                <Image src={script.activeFields.includes('audio') ? "/blue-microphone.svg" : "/blue-microphone.svg"} alt="Locução" width={22} height={22} style={{ width: "22px", height: "22px" }} />
                                                                <span style={{ fontSize: '16px' }}>Locução</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {script.activeFields.length === 0 ?
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0' }}><span>Adicione <b>elementos</b> na cena e comece sua história!</span></div>
                                                :
                                                <div style={{ display: 'flex', gap: '16px', padding: '16px' }}>
                                                    <div style={{ flex: "1", display: 'flex', flexDirection: "column", gap: '8px' }}>
                                                        {script.activeFields.includes('description') &&
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', border: '0.5px solid rgb(18, 14, 35)', borderRadius: '4px' }}>
                                                                <Image src="/description.svg" alt="Descrição" width={18} height={18} style={{ width: "18px", height: "18px" }} />
                                                                <ScriptInput placeholder='Descrição' value={script.description} onChange={value => sceneChange(script, 'description', true, value)} />
                                                            </div>
                                                        }
                                                        {script.activeFields.includes('takes') &&
                                                            <div
                                                                id={`script-list`}
                                                                style={{
                                                                    padding: '12px',
                                                                    border: script.timecodes.length === 0 ? '1px dashed rgb(158, 156, 168)' : '1px solid rgb(158, 156, 168)',
                                                                    borderRadius: '4px',
                                                                    backgroundColor: 'white'
                                                                }}
                                                                onDragOver={handleDragOver}
                                                                onDrop={(e) => handleDrop(e, id)}
                                                            >
                                                                {script.timecodes.length === 0 ?
                                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '24px 0' }}>
                                                                        <Image src="/V.svg" alt="Vídeo" width={16} height={16} style={{ width: "16px", height: "16px" }} />
                                                                        <span style={{ fontSize: '12px', color: 'rgb(158, 156, 168)' }}>Takes</span>
                                                                    </div>
                                                                    :
                                                                    <div
                                                                        key={id}
                                                                        style={{
                                                                            display: 'grid',
                                                                            gridTemplateColumns: 'repeat(2, 1fr)',
                                                                            gap: '16px',
                                                                        }}
                                                                    >
                                                                        {script.timecodes.map((timecode, timecodeId) => {
                                                                            return (
                                                                                <div
                                                                                    key={`script-${timecode.id}`}
                                                                                    onDragStart={(e) => handleDragStart(e, timecode, timecodeId, 'script', id)}
                                                                                    onDragEnd={handleDragEnd}
                                                                                    draggable
                                                                                    style={{ cursor: 'move' }}
                                                                                >
                                                                                    <TimecodeCard
                                                                                        id={id}
                                                                                        timecode={timecode}
                                                                                        updateTimecode={updatedTimecode => updateTimecode(updatedTimecode, "script-timecodes")}
                                                                                        setActiveMenu={setActiveMenu}
                                                                                        activeMenu={activeMenu}
                                                                                        ratingChanged={(timecode, rating) => ratingChanged(timecode, rating, "script-timecodes")}
                                                                                        type="script"
                                                                                    />
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                }
                                                            </div>
                                                        }
                                                    </div>
                                                    <div style={{ flex: "1", display: 'flex', flexDirection: "column", gap: '8px' }}>
                                                        {script.activeFields.includes('audio') &&
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', border: '0.5px solid rgb(18, 14, 35)', borderRadius: '4px' }}>
                                                                <Image src="/A.svg" alt="Áudio" width={18} height={18} style={{ width: "18px", height: "18px" }} />
                                                                <ScriptInput placeholder='Áudio' value={script.audio} onChange={value => sceneChange(script, 'audio', true, value)} />
                                                            </div>
                                                        }
                                                        {script.activeFields.includes('locution') &&
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', border: '0.5px solid rgb(18, 14, 35)', borderRadius: '4px' }}>
                                                                <Image src="/blue-microphone.svg" alt="Locução" width={18} height={18} style={{ width: "18px", height: "18px" }} />
                                                                <ScriptInput placeholder='Locução' value={script.locution} onChange={value => sceneChange(script, 'locution', true, value)} />
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    }
                </div>
            )}
        </div>
    );
};

export default TimecodesSection;
