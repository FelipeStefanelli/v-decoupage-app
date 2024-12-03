'use client'
import React, { useState, useEffect } from 'react';
import './page.css'; // Certifique-se de importar o CSS
import TimecodeCard from "../../components/timecode-card";
import TimecodeCardReadOnly from "../../components/timecode-card-read-only";
import ScriptInput from "../../components/script-input";
import io from "socket.io-client";
import Image from "next/image";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const socket = io();

const TimecodesSection = (props) => {
    const [timecodes, setTimecodes] = useState([]);
    const [scripts, setScripts] = useState([]);
    const [activeMenu, setActiveMenu] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [moveDropdownOpen, setMoveDropdownOpen] = useState(null);
    const [moveSceneId, setMoveSceneId] = useState('');
    const [views, setViews] = useState(null);

    let draggedCard = null;
    let draggedCardInfo = null;
    let dropZone = null;

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

    useEffect(() => {
        setViews({
            'classification': localStorage.getItem('classification-view'),
            'description': localStorage.getItem('description-view'),
            'takes': localStorage.getItem('takes-view'),
            'audio': localStorage.getItem('audio-view'),
            'locution': localStorage.getItem('locution-view'),
            'audios': localStorage.getItem('audios-view')
        })
    }, []);

    useEffect(() => {
        const handleStorageChange = (event) => {
            const key = event.detail.key.replace('-view', '');
            const value = event.detail.value;

            // Atualiza o estado com o novo valor
            setViews((prevViews) => ({
                ...prevViews,
                [key]: value,
            }));
        };
        window.addEventListener('localStorageUpdated', handleStorageChange);

        return () => {
            window.removeEventListener('localStorageUpdated', handleStorageChange);
        };
    }, []);

    const fetchTimecodes = async () => {
        const response = await fetch("/api");
        const data = await response.json();
        if (data) {
            data?.timecodes && setTimecodes(data.timecodes);
            data?.script && setScripts(data.script);
        } else {
            console.error(data.error);
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

    const changeScene = (script, field, isValueChange, value) => {
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

    const addScene = (id) => {
        var updatedTimecodes = [...timecodes];
        var updatedScripts = [...scripts];
        updatedScripts.splice(id + 1, 0, {
            "id": '',
            "name": '',
            "description": "",
            "audio": "",
            "locution": "",
            "activeFields": [],
            "timecodes": [],
            "audios": []
        });
        updatedScripts = updatedScripts.map((script, scriptId) => {
            return {
                "id": `scene-${scriptId + 1}`,
                "name": `Cena ${scriptId + 1}`,
                "description": script.description,
                "audio": script.audio,
                "locution": script.locution,
                "activeFields": script.activeFields,
                "timecodes": script.timecodes,
                "audios": script.audios
            }
        })
        updateJson(updatedTimecodes, updatedScripts);
    }

    const removeScene = (id) => {
        const updatedTimecodes = [...timecodes];
        const updatedScripts = [...scripts];
        updatedScripts.splice(id, 1);
        updatedScripts.map((script, scriptId) => {
            script.id = `scene-${scriptId + 1}`;
            script.name = `Cena ${scriptId + 1}`
        });
        console.log('updatedScripts', updatedScripts)
        updateJson(updatedTimecodes, updatedScripts)
    }

    const moveSceneById = (value, id) => {
        setMoveDropdownOpen(null);
        setMoveSceneId('');
        const sceneId = id;
        const newSceneId = parseInt(value);
        var updatedTimecodes = [...timecodes];
        var updatedScripts = [...scripts];
        var removedScript = updatedScripts.splice(sceneId, 1);
        updatedScripts.splice(newSceneId - 1, 0, removedScript[0]);
        updatedScripts.map((script, scriptId) => {
            script.id = `scene-${scriptId + 1}`;
            script.name = `Cena ${scriptId + 1}`
        });
        updateJson(updatedTimecodes, updatedScripts);
    }

    function createDropZone() {
        const zone = document.createElement('div');

        zone.classList.add('card', 'drop-zone');
        return zone;
    }

    function getDropPosition(targetGrid, event) {
        const allCards = [...targetGrid.querySelectorAll('.card')];
        const rects = allCards.map(card => card.getBoundingClientRect());
        return rects.findIndex(rect => event.clientY < rect.bottom && event.clientX < rect.right);
    }

    function handleDragOver(event) {
        event.preventDefault();
        const grid = event.currentTarget;
        const droppedPosition = getDropPosition(grid, event);

        const existingDropZone = grid.querySelector('.drop-zone');
        if (existingDropZone) {
            //console.log(2)
            existingDropZone.remove()
        };

        if (!dropZone) {
            //console.log(1)
            dropZone = createDropZone();
        }
        if (grid.id.includes('timecodes')) {
            dropZone.classList.remove('script-drop-zone');
            dropZone.classList.remove('audio-drop-zone');
            dropZone.classList.add('timecode-drop-zone');
        } else if (grid.id.includes('scripts')) {
            dropZone.classList.remove('audio-drop-zone');
            dropZone.classList.remove('timecode-drop-zone');
            dropZone.classList.add('script-drop-zone');
        } else if (grid.id.includes('audios')) {
            dropZone.classList.remove('timecode-drop-zone');
            dropZone.classList.remove('script-drop-zone');
            dropZone.classList.add('audio-drop-zone');
        }
        if (droppedPosition === -1 || grid.children.length === 0) {
            grid.appendChild(dropZone);
        } else {
            grid.insertBefore(dropZone, grid.children[droppedPosition]);
        }
    }


    function alertError(msg) {
        return toast.error(msg, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            progress: undefined,
        });
    }

    function checkTakeMove(draggedCardInfo, scriptTimecodesAudios, type) {
        console.log('draggedCardInfo', draggedCardInfo)
        console.log('scriptTimecodes', scriptTimecodesAudios)
        let canMoveTake = true;
        let error = '';

        if (!draggedCardInfo.type) {
            canMoveTake = false;
            error = "Classifique o take para move-lo a uma cena!";
            return {
                canMoveTake,
                error
            }
        } else if (type === 'timecode' && draggedCardInfo.type === 'A') {
            canMoveTake = false;
            error = "Áudios só podem ser movidos para a coluna de áudio";
            return {
                canMoveTake,
                error
            }
        } else if (type === 'audio' && (draggedCardInfo.type === 'V' || draggedCardInfo.type === 'AV')) {
            canMoveTake = false;
            error = "Videos só podem ser movidos para a coluna de takes";
            return {
                canMoveTake,
                error
            }
        } else {
            scriptTimecodesAudios.timecodes.map(timecode => {
                if (timecode.type === 'AV') {
                    canMoveTake = false;
                    error = "Essa cena já contém um AV e não pode receber mais takes!";
                }
                if (timecode.type === 'V' && draggedCardInfo.type === 'AV') {
                    canMoveTake = false;
                    error = "Essa cena já contém um vídeo, portanto não pode receber um AV!";
                }
            });
            scriptTimecodesAudios.audios.map(timecode => {
                if (timecode.type === 'A' && draggedCardInfo.type === 'AV') {
                    canMoveTake = false;
                    error = "Essa cena já contém um áudio, portanto não pode receber um AV!";
                }
            });
            return {
                canMoveTake,
                error
            }
        }
    }

    function handleDrop(event) {
        const grid = event.currentTarget;
        const gridType = grid.id.includes('timecodes') ? 'timecodes' : grid.id.includes('scripts') ? 'scripts' : grid.id.includes('audios') ? 'audios' : '';
        const droppedPosition = getDropPosition(grid, event);
        if (dropZone) dropZone.remove();

        if (draggedCard && grid) {
            if (gridType === 'timecodes') {
                if (draggedCard.parentElement.id === 'grid-timecodes') {
                    const updatedTimecodes = [...timecodes];

                    // Remove o card da posição original
                    const originalIndex = updatedTimecodes.indexOf(draggedCardInfo);
                    updatedTimecodes.splice(originalIndex, 1);

                    // Ajusta a posição de inserção se o card foi arrastado dentro da mesma lista
                    const adjustedPosition = droppedPosition > originalIndex ? droppedPosition - 1 : droppedPosition;

                    // Insere o card na nova posição ajustada
                    updatedTimecodes.splice(adjustedPosition, 0, draggedCardInfo);

                    // Atualiza o estado do grid-timecodes
                    setTimecodes(updatedTimecodes);
                    updateJson(updatedTimecodes, scripts);
                } else if (draggedCard.parentElement.id.includes('grid-scripts')) {
                    const draggedFromScript = draggedCard.parentElement.id.replace('grid-scripts-', '');
                    const updatedTimecodes = [...timecodes];
                    const updatedScripts = [...scripts];

                    // Remove o card de grid-scripts
                    updatedScripts[draggedFromScript].timecodes.splice(updatedScripts[draggedFromScript].timecodes.indexOf(draggedCardInfo), 1);

                    // Insere o card no grid-timecodes na posição correta
                    updatedTimecodes.splice(droppedPosition, 0, draggedCardInfo);

                    // Atualiza os estados dos grids
                    setTimecodes(updatedTimecodes);
                    setScripts(updatedScripts);
                    updateJson(updatedTimecodes, updatedScripts);
                } else if (draggedCard.parentElement.id.includes('grid-audios')) {
                    const draggedFromScript = draggedCard.parentElement.id.replace('grid-audios-', '');
                    const updatedTimecodes = [...timecodes];
                    const updatedScripts = [...scripts];

                    // Remove o card de grid-scripts
                    updatedScripts[draggedFromScript].audios.splice(updatedScripts[draggedFromScript].audios.indexOf(draggedCardInfo), 1);

                    // Insere o card no grid-audios na posição correta
                    updatedTimecodes.splice(droppedPosition, 0, draggedCardInfo);

                    // Atualiza os estados dos grids
                    setTimecodes(updatedTimecodes);
                    setScripts(updatedScripts);
                    updateJson(updatedTimecodes, updatedScripts);
                }
            } else if (gridType === 'scripts') {
                if (draggedCard.parentElement.id === 'grid-timecodes') {
                    const draggedFromScript = grid.id.replace('grid-scripts-', '');
                    const updatedTimecodes = [...timecodes];
                    const updatedScripts = [...scripts];

                    const movePermissions = checkTakeMove(draggedCardInfo, updatedScripts[draggedFromScript], 'timecode');
                    if (movePermissions && !movePermissions.canMoveTake) {
                        return alertError(movePermissions.error);
                    }

                    const originalIndex = updatedTimecodes.indexOf(draggedCardInfo);
                    updatedTimecodes.splice(originalIndex, 1);

                    // Insere o card no grid-timecodes na posição correta
                    updatedScripts[draggedFromScript].timecodes.splice(droppedPosition, 0, draggedCardInfo);

                    // Atualiza os estados dos grids
                    setTimecodes(updatedTimecodes);
                    setScripts(updatedScripts);
                    updateJson(updatedTimecodes, updatedScripts);
                } else if (draggedCard.parentElement.id.includes('grid-scripts')) {
                    const draggedFromScript = draggedCard.parentElement.id.replace('grid-scripts-', '');
                    const draggedToScript = grid.id.replace('grid-scripts-', '');
                    const updatedTimecodes = [...timecodes];
                    const updatedScripts = [...scripts];

                    const movePermissions = checkTakeMove(draggedCardInfo, updatedScripts[draggedFromScript], 'timecode');
                    if (movePermissions && !movePermissions.canMoveTake) {
                        return alertError(movePermissions.error);
                    }
                    updatedScripts[draggedFromScript].timecodes.splice(updatedScripts[draggedFromScript].timecodes.indexOf(draggedCardInfo), 1);

                    // Insere o card no grid-timecodes na posição correta
                    updatedScripts[draggedToScript].timecodes.splice(droppedPosition, 0, draggedCardInfo);

                    // Atualiza os estados dos grids
                    setTimecodes(updatedTimecodes);
                    setScripts(updatedScripts);
                    updateJson(updatedTimecodes, updatedScripts);
                } else if (draggedCard.parentElement.id.includes('grid-audios')) {
                    alertError('Não pode mover audio para take')
                }
            } else if (gridType === 'audios') {
                if (draggedCard.parentElement.id === 'grid-timecodes') {
                    const draggedFromAudio = grid.id.replace('grid-audios-', '');
                    const updatedTimecodes = [...timecodes];
                    const updatedScripts = [...scripts];

                    const movePermissions = checkTakeMove(draggedCardInfo, updatedScripts[draggedFromAudio], 'audio');
                    if (movePermissions && !movePermissions.canMoveTake) {
                        return alertError(movePermissions.error);
                    }

                    const originalIndex = updatedTimecodes.indexOf(draggedCardInfo);
                    updatedTimecodes.splice(originalIndex, 1);

                    // Insere o card no grid-timecodes na posição correta
                    updatedScripts[draggedFromAudio].audios.splice(droppedPosition, 0, draggedCardInfo);

                    // Atualiza os estados dos grids
                    setTimecodes(updatedTimecodes);
                    setScripts(updatedScripts);
                    updateJson(updatedTimecodes, updatedScripts);
                } else if (draggedCard.parentElement.id.includes('grid-audios')) {
                    const draggedFromScript = draggedCard.parentElement.id.replace('grid-audios-', '');
                    const draggedToScript = grid.id.replace('grid-audios-', '');
                    const updatedTimecodes = [...timecodes];
                    const updatedScripts = [...scripts];

                    const movePermissions = checkTakeMove(draggedCardInfo, updatedScripts[draggedFromScript], 'audio');
                    if (movePermissions && !movePermissions.canMoveTake) {
                        return alertError(movePermissions.error);
                    }
                    updatedScripts[draggedFromScript].audios.splice(updatedScripts[draggedFromScript].audios.indexOf(draggedCardInfo), 1);

                    // Insere o card no grid-audios na posição correta
                    updatedScripts[draggedToScript].audios.splice(droppedPosition, 0, draggedCardInfo);

                    // Atualiza os estados dos grids
                    setTimecodes(updatedTimecodes);
                    setScripts(updatedScripts);
                    updateJson(updatedTimecodes, updatedScripts);
                } else if (draggedCard.parentElement.id.includes('grid-scripts')) {
                    alertError('Não pode mover take para audio')
                }
            }
        }

        draggedCard.classList.remove('dragging');
        draggedCard.classList.remove('hidden'); // Faz o card voltar a ser visível
        draggedCard = null;
    }

    const handleDragStart = (event, card) => {
        draggedCard = event.target;
        draggedCardInfo = card;
        if (draggedCard) { // Verifica se o card foi encontrado
            setTimeout(() => draggedCard.classList.add('hidden'), 0);
        }
    };

    const handleDragEnd = (event) => {
        if (draggedCard) { // Verifica se draggedCard não é null
            if (dropZone) {
                dropZone.remove();
                dropZone = null;
            }

            draggedCard.classList.remove('hidden'); // Faz o card voltar a ser visível
            draggedCard = null;
        }
    };

    const toggleDropdown = (id) => {
        setDropdownOpen(dropdownOpen === id ? null : id);
    };

    const toggleMoveDropdown = (id) => {
        setMoveDropdownOpen(moveDropdownOpen === id ? null : id);
        if (moveDropdownOpen) {
            setTimeout(() => {
                document.getElementById(`scene-${id + 1}`).focus();
            }, 10);
        }
    };

    return (
        <div className="page">
            <div
                className="grid"
                id="grid-timecodes"
                style={{ backgroundColor: "rgba(231, 231, 231)", padding: '16px', gridTemplateColumns: 'repeat(3, 1fr)', flex: 1 }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {timecodes.map((card, timecodeId) => (
                    <div
                        key={timecodeId}
                        className="card"
                        draggable="true"
                        onDragStart={e => handleDragStart(e, card)}
                        onDragEnd={handleDragEnd}
                    >
                        <TimecodeCard
                            id={timecodeId}
                            timecode={card}
                            updateTimecode={updatedTimecode => updateTimecode(updatedTimecode)}
                            setActiveMenu={setActiveMenu}
                            activeMenu={activeMenu}
                            ratingChanged={(timecode, rating) => ratingChanged(timecode, rating)}
                            type="timecode"
                            views={views}
                            cardType="timecode"
                        />
                    </div>
                ))}
            </div>
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
                                <div key={id} >
                                    <div style={{ border: '1px solid #b4b4b4' }}>
                                        <div style={{ display: "flex", justifyContent: 'space-between', backgroundColor: 'rgb(231, 231, 231)', padding: '12px' }}>
                                            <p style={{ fontSize: "18px" }}>{script.name}</p>
                                            <div style={{ display: "flex", gap: '16px', fontSize: "18px", position: 'relative' }}>
                                                <Image
                                                    aria-hidden
                                                    src="/move.svg"
                                                    alt="Move Icon"
                                                    width={24}
                                                    height={24}
                                                    style={{ width: "24px", height: "24px", cursor: 'pointer' }}
                                                    priority
                                                    onClick={() => toggleMoveDropdown(id)}
                                                />
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
                                                    onClick={() => removeScene(id)}
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
                                                        {views.description === 'show' &&
                                                            <div
                                                                onClick={() => changeScene(script, 'description', false)}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 16px 10px 16px', cursor: 'pointer', background: 'rgba(121, 116, 126, 0.1)' }}
                                                            >
                                                                <Image src="/description.svg" alt="Descrição" width={22} height={22} style={{ width: "22px", height: "22px" }} />
                                                                <span style={{ fontSize: '16px' }}>Descrição</span>
                                                            </div>
                                                        }
                                                        {views.takes === 'show' &&
                                                            <div
                                                                onClick={() => changeScene(script, 'takes', false)}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', background: 'rgba(121, 116, 126, 0.1)' }}
                                                            >
                                                                <Image src={script.activeFields.includes('takes') ? "/V.svg" : "/blue-V.svg"} alt="Takes" width={22} height={22} style={{ width: "22px", height: "22px" }} />
                                                                <span style={{ fontSize: '16px' }}>Takes</span>
                                                            </div>
                                                        }
                                                        {views.audio === 'show' &&
                                                            <div
                                                                onClick={() => changeScene(script, 'audio', false)}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', background: 'rgba(121, 116, 126, 0.1)' }}
                                                            >
                                                                <Image src={script.activeFields.includes('audio') ? "/A.svg" : "/blue-A.svg"} alt="Áudio" width={22} height={22} style={{ width: "22px", height: "22px" }} />
                                                                <span style={{ fontSize: '16px' }}>Áudio</span>
                                                            </div>
                                                        }
                                                        {views.locution === 'show' &&
                                                            <div
                                                                onClick={() => changeScene(script, 'locution', false)}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px 16px 16px', cursor: 'pointer', background: 'rgba(121, 116, 126, 0.1)' }}
                                                            >
                                                                <Image src={script.activeFields.includes('locution') ? "/blue-microphone.svg" : "/blue-microphone.svg"} alt="Locução" width={22} height={22} style={{ width: "22px", height: "22px" }} />
                                                                <span style={{ fontSize: '16px' }}>Locução</span>
                                                            </div>
                                                        }
                                                        {views.audios === 'show' &&
                                                            script.timecodes.filter(timecode => timecode.type === 'AV').length === 0 &&
                                                            <div
                                                                onClick={() => changeScene(script, 'audios', false)}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', background: 'rgba(121, 116, 126, 0.1)' }}
                                                            >
                                                                <Image src={script.activeFields.includes('audios') ? "/A.svg" : "/blue-A.svg"} alt="Áudio" width={22} height={22} style={{ width: "22px", height: "22px" }} />
                                                                <span style={{ fontSize: '16px' }}>Áudios</span>
                                                            </div>
                                                        }
                                                    </div>
                                                )}
                                                {moveDropdownOpen === id && (
                                                    <div style={{
                                                        width: '580px',
                                                        position: 'absolute',
                                                        top: '36px',
                                                        right: '0',
                                                        backgroundColor: 'white',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                                        zIndex: '10',
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', border: '0.5px solid rgb(18, 14, 35)', borderRadius: '4px' }}>
                                                            <span>Mover para cena</span>
                                                            <ScriptInput
                                                                placeholder='Index'
                                                                value={moveSceneId}
                                                                onChange={value => {
                                                                    setMoveSceneId(value);
                                                                }}
                                                                script={script}
                                                                id={script.id}
                                                            />
                                                            <Image src="/send.svg" alt="Descrição" width={36} height={36} style={{ width: "36px", height: "36px", cursor: 'pointer' }} onClick={() => moveSceneById(moveSceneId, id)} />
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
                                                    {script.activeFields.includes('description') && views.description === 'show' &&
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', border: '0.5px solid rgb(18, 14, 35)', borderRadius: '4px' }}>
                                                            <Image src="/description.svg" alt="Descrição" width={18} height={18} style={{ width: "18px", height: "18px" }} />
                                                            <ScriptInput placeholder='Descrição' value={script.description} onChange={value => changeScene(script, 'description', true, value)} script={script} />
                                                        </div>
                                                    }
                                                    {script.activeFields.includes('takes') && views.takes === 'show' &&
                                                        <div
                                                            style={
                                                                script.timecodes.filter(timecode => timecode.type === 'AV').length === 0 ?
                                                                    {
                                                                        padding: '12px',
                                                                        border: '1px dashed rgb(158, 156, 168)',
                                                                        borderRadius: '4px',
                                                                        backgroundColor: 'rgb(242, 242, 242)'
                                                                    }
                                                                    :
                                                                    {
                                                                        padding: '12px',
                                                                        borderRadius: "6px",
                                                                        border: '1px dashed rgb(158, 156, 168)',
                                                                        marginTop: 'auto'
                                                                    }
                                                            }
                                                        >
                                                            {script.timecodes.length === 0 ?
                                                                <div
                                                                    className="grid"
                                                                    id={`grid-scripts-${id}`}
                                                                    style={{ position: 'relative', minHeight: '90px' }}
                                                                    onDragOver={handleDragOver}
                                                                    onDrop={handleDrop}
                                                                >
                                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', position: 'absolute', width: '100%', height: '100%' }}>
                                                                        <Image src="/V.svg" alt="Vídeo" width={16} height={16} style={{ width: "16px", height: "16px" }} />
                                                                        <span style={{ fontSize: '12px', color: 'rgb(158, 156, 168)' }}>Takes</span>
                                                                    </div>
                                                                </div>
                                                                :
                                                                <div
                                                                    key={id}
                                                                    className="grid"
                                                                    style={{
                                                                        gridTemplateColumns: script.timecodes.filter(timecode => timecode.type === 'AV').length === 0 ? 'repeat(2, 1fr)' : '1fr 1fr'
                                                                    }}
                                                                    id={`grid-scripts-${id}`}
                                                                    onDragOver={handleDragOver}
                                                                    onDrop={handleDrop}
                                                                >
                                                                    {script.timecodes.map((timecode, scriptTimecodeId) => (
                                                                        <div
                                                                            key={scriptTimecodeId}
                                                                            className="card"
                                                                            draggable="true"
                                                                            onDragStart={e => handleDragStart(e, timecode)}
                                                                            onDragEnd={handleDragEnd}
                                                                        >
                                                                            <TimecodeCard
                                                                                id={scriptTimecodeId}
                                                                                timecode={timecode}
                                                                                updateTimecode={updatedTimecode => updateTimecode(updatedTimecode, "script-timecodes", script)}
                                                                                setActiveMenu={setActiveMenu}
                                                                                activeMenu={activeMenu}
                                                                                ratingChanged={(timecode, rating) => ratingChanged(timecode, rating, "script-timecodes")}
                                                                                type={timecode.type === 'AV' ? "AV" : "script"}
                                                                                views={views}
                                                                                cardType="script"
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            }
                                                        </div>
                                                    }
                                                </div>
                                                <div style={{ flex: "1", display: 'flex', flexDirection: "column", gap: '8px' }}>
                                                    {script.activeFields.includes('audio') && views.audio === 'show' &&
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', border: '0.5px solid rgb(18, 14, 35)', borderRadius: '4px' }}>
                                                            <Image src="/A.svg" alt="Áudio" width={18} height={18} style={{ width: "18px", height: "18px" }} />
                                                            <ScriptInput placeholder='Áudio' value={script.audio} onChange={value => changeScene(script, 'audio', true, value)} script={script} />
                                                        </div>
                                                    }
                                                    {script.activeFields.includes('locution') && views.locution === 'show' &&
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', border: '0.5px solid rgb(18, 14, 35)', borderRadius: '4px' }}>
                                                            <Image src="/blue-microphone.svg" alt="Locução" width={18} height={18} style={{ width: "18px", height: "18px" }} />
                                                            <ScriptInput placeholder='Locução' value={script.locution} onChange={value => changeScene(script, 'locution', true, value)} script={script} />
                                                        </div>
                                                    }
                                                    {script.activeFields.includes('audios') && script.timecodes.filter(timecode => timecode.type === 'AV').length === 0 && views.audios === 'show' &&
                                                        <div
                                                            style={{
                                                                padding: '12px',
                                                                border: script.timecodes.length === 0 ? '1px dashed rgb(158, 156, 168)' : '1px dashed rgb(158, 156, 168)',
                                                                borderRadius: '4px',
                                                                backgroundColor: 'rgb(242, 242, 242)'
                                                            }}
                                                        >
                                                            {script.audios.length === 0 ?
                                                                <div
                                                                    className="grid grid-3"
                                                                    id={`grid-audios-${id}`}
                                                                    style={{ position: 'relative', minHeight: '90px' }}
                                                                    onDragOver={handleDragOver}
                                                                    onDrop={handleDrop}
                                                                >
                                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', position: 'absolute', width: '100%', height: '100%' }}>
                                                                        <Image src="/A.svg" alt="Vídeo" width={16} height={16} style={{ width: "16px", height: "16px" }} />
                                                                        <span style={{ fontSize: '12px', color: 'rgb(158, 156, 168)' }}>Áudios</span>
                                                                    </div>
                                                                </div>
                                                                :
                                                                <div
                                                                    key={id}
                                                                    className="grid grid-3"
                                                                    id={`grid-audios-${id}`}
                                                                    onDragOver={handleDragOver}
                                                                    onDrop={handleDrop}
                                                                >
                                                                    {script.audios.map((audio, scriptAudioId) => {
                                                                        return (
                                                                            <div
                                                                                key={scriptAudioId}
                                                                                className="card"
                                                                                draggable="true"
                                                                                onDragStart={e => handleDragStart(e, audio)}
                                                                                onDragEnd={handleDragEnd}
                                                                            >
                                                                                <TimecodeCard
                                                                                    id={scriptAudioId}
                                                                                    timecode={audio}
                                                                                    updateTimecode={updatedTimecode => updateTimecode(updatedTimecode, "script-audios", script)} //AQUI
                                                                                    setActiveMenu={setActiveMenu}
                                                                                    activeMenu={activeMenu}
                                                                                    ratingChanged={(timecode, rating) => ratingChanged(timecode, rating, "script-audios")} // AQUI
                                                                                    type="audio"
                                                                                    views={views}
                                                                                    cardType="script"
                                                                                />
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            }
                                                        </div>
                                                    }
                                                    {script.timecodes.map((timecode, scriptTimecodeId) => {
                                                        if (timecode.type === 'AV') {
                                                            return (
                                                                <div key={scriptTimecodeId}>
                                                                    <TimecodeCard
                                                                        id={scriptTimecodeId}
                                                                        timecode={timecode}
                                                                        updateTimecode={updatedTimecode => updateTimecode(updatedTimecode, "script-timecodes", script)} //AQUI
                                                                        setActiveMenu={setActiveMenu}
                                                                        activeMenu={activeMenu}
                                                                        ratingChanged={(timecode, rating) => ratingChanged(timecode, rating, "script-timecodes")} // AQUI
                                                                        type="AV-audio"
                                                                        views={views}
                                                                        cardType="script"
                                                                    />
                                                                </div>
                                                            )
                                                        }
                                                    })}
                                                </div>
                                            </div>
                                        }
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: '16px' }}>
                                        <span onClick={() => addScene(id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', backgroundColor: '#000', borderRadius: '50%', cursor: 'pointer' }}>
                                            <Image src="/plus.svg" alt="Áudio" width={12} height={12} style={{ width: "12px", height: "12px" }} />
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            }
            <ToastContainer />
        </div>
    );
};

export default TimecodesSection;
