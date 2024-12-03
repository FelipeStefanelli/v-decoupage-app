'use client'
import React, { useState, useEffect } from 'react';
import './page.css'; // Certifique-se de importar o CSS
import TimecodeCard from "../../components/timecode-card";
import ScriptInput from "../../components/script-input";
import io from "socket.io-client";
import Image from "next/image";

const socket = io();

const TimecodesSection = (props) => {
    const [timecodes, setTimecodes] = useState([]);
    const [scripts, setScripts] = useState([]);
    const [activeMenu, setActiveMenu] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(null);

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
        console.log(requestBody)
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

    useEffect(() => {
        const grids = document.querySelectorAll('.grid');

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
            // Converta a NodeList em um array para poder usar indexOf

            if (!dropZone) {
                dropZone = createDropZone();
            }

            const existingDropZone = grid.querySelector('.drop-zone');
            if (existingDropZone) existingDropZone.remove();

            if (droppedPosition === -1 || grid.children.length === 0) {
                grid.appendChild(dropZone);
            } else {
                grid.insertBefore(dropZone, grid.children[droppedPosition]);
            }
        }

        function handleDrop(event) {
            const grid = event.currentTarget;
            const droppedPosition = getDropPosition(grid, event);
            if (dropZone) dropZone.remove();

            if (draggedCard && grid) {
                if (grid.id === 'grid1') {
                    if (draggedCard.parentElement.id === 'grid1') {
                        // Reordena dentro do grid 1
                        const updatedGrid = [...timecodes];

                        // Remove o card da posição original
                        const originalIndex = updatedGrid.indexOf(draggedCardInfo);
                        updatedGrid.splice(originalIndex, 1);

                        // Ajusta a posição de inserção se o card foi arrastado dentro da mesma lista
                        const adjustedPosition = droppedPosition > originalIndex ? droppedPosition - 1 : droppedPosition;

                        // Insere o card na nova posição ajustada
                        updatedGrid.splice(adjustedPosition, 0, draggedCardInfo);

                        // Atualiza o estado do grid1
                        setTimecodes(updatedGrid);
                        updateJson(updatedGrid, scripts);
                    } else {
                        const draggedFromScript = draggedCard.parentElement.id.replace('grid2-', '');
                        // Move do grid 2 para o grid 1
                        const updatedGrid1 = [...timecodes];
                        const updatedGrid2 = [...scripts];

                        // Remove o card de grid2
                        updatedGrid2[draggedFromScript].timecodes.splice(updatedGrid2[draggedFromScript].timecodes.indexOf(draggedCardInfo), 1);

                        // Insere o card no grid1 na posição correta
                        updatedGrid1.splice(droppedPosition, 0, draggedCardInfo);

                        // Atualiza os estados dos grids
                        setTimecodes(updatedGrid1);
                        setScripts(updatedGrid2);
                        updateJson(updatedGrid1, updatedGrid2);
                    }
                } else {
                    if (draggedCard.parentElement.id === 'grid1') {
                        const draggedFromScript = grid.id.replace('grid2-', '');
                        const updatedGrid1 = [...timecodes];
                        const updatedGrid2 = [...scripts];

                        const originalIndex = updatedGrid1.indexOf(draggedCardInfo);
                        updatedGrid1.splice(originalIndex, 1);

                        // Insere o card no grid1 na posição correta
                        updatedGrid2[draggedFromScript].timecodes.splice(droppedPosition, 0, draggedCardInfo);

                        // Atualiza os estados dos grids
                        setTimecodes(updatedGrid1);
                        setScripts(updatedGrid2);
                        updateJson(updatedGrid1, updatedGrid2);
                    } else {
                        const draggedFromScript = draggedCard.parentElement.id.replace('grid2-', '');
                        const draggedToScript = grid.id.replace('grid2-', '');
                        const updatedGrid1 = [...timecodes];
                        const updatedGrid2 = [...scripts];

                        updatedGrid2[draggedFromScript].timecodes.splice(updatedGrid2[draggedFromScript].timecodes.indexOf(draggedCardInfo), 1);

                        // Insere o card no grid1 na posição correta
                        updatedGrid2[draggedToScript].timecodes.splice(droppedPosition, 0, draggedCardInfo);

                        // Atualiza os estados dos grids
                        setTimecodes(updatedGrid1);
                        setScripts(updatedGrid2);
                        updateJson(updatedGrid1, updatedGrid2);
                    }
                }
            }

            draggedCard.classList.remove('dragging');
            draggedCard.classList.remove('hidden'); // Faz o card voltar a ser visível
            draggedCard = null;
        }

        // Event listeners para os grids
        grids.forEach(grid => {
            grid.addEventListener('dragover', handleDragOver);
            grid.addEventListener('drop', handleDrop);
        });

        return () => {
            grids.forEach(grid => {
                grid.removeEventListener('dragover', handleDragOver);
                grid.removeEventListener('drop', handleDrop);
            });
        };
    }, [timecodes, scripts]);

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


    return (
        <div className="page">
            <div className="grid grid-1" id="grid1" style={{ backgroundColor: "rgba(231, 231, 231)", padding: '16px' }}>
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
                                                            backgroundColor: 'rgb(242, 242, 242)'
                                                        }}
                                                    >
                                                        {script.timecodes.length === 0 ?
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '24px 0' }}>
                                                                <Image src="/V.svg" alt="Vídeo" width={16} height={16} style={{ width: "16px", height: "16px" }} />
                                                                <span style={{ fontSize: '12px', color: 'rgb(158, 156, 168)' }}>Takes</span>
                                                            </div>
                                                            :
                                                            <div key={id} className="grid grid-2" id={`grid2-${id}`}>
                                                                {script.timecodes.map((card, scriptTimecodeId) => (
                                                                    <div
                                                                        key={scriptTimecodeId}
                                                                        className="card"
                                                                        draggable="true"
                                                                        onDragStart={e => handleDragStart(e, card)}
                                                                        onDragEnd={handleDragEnd}
                                                                    >
                                                                        <TimecodeCard
                                                                            id={scriptTimecodeId}
                                                                            timecode={card}
                                                                            updateTimecode={updatedTimecode => updateTimecode(updatedTimecode, "script-timecodes", script)}
                                                                            setActiveMenu={setActiveMenu}
                                                                            activeMenu={activeMenu}
                                                                            ratingChanged={(timecode, rating) => ratingChanged(timecode, rating, "script-timecodes")}
                                                                            type="script"
                                                                        />
                                                                    </div>
                                                                ))}
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
    );
};

export default TimecodesSection;
