"use client"

import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useRef, useState, useEffect } from "react";
import { formatTimecode } from "@/utils/utils";
import html2pdf from 'html2pdf.js';
import ScriptInput from "./script-input";
import { useVisibility } from '@/contexts/VisibilityContext';

export default function Header(props) {
    const pathname = usePathname();
    const [projectName, setProjectName] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [data, setData] = useState(null);
    const [showPreview, setshowPreview] = useState(null);
    const [pdfController, setPdfController] = useState(null);

    const { views, toggleView } = useVisibility();

    const contentRef = useRef(null);

    const pxToPt = (pixels) => {
        return pixels / 1.3333;
    };

    useEffect(() => {
        if (pdfController) {
            const options = {
                filename: 'documento.pdf', // Nome do arquivo PDF gerado
                html2canvas: { scale: 2 }, // Escala para capturar com mais definição
                jsPDF: { unit: 'pt', format: [710, pxToPt(contentRef.current.children[1].children[0].offsetHeight)] }, // Configurações do jsPDF
            };


            html2pdf()
                .from(contentRef.current.children[1].children[0]) // Passa a referência do conteúdo HTML
                .set(options) // Define as opções
                .save(); // Salva o arquivo gerado

            setPdfController(null);
        }
    }, [pdfController]);

    const closeModal = () => {
        setModalVisible(false);
    };

    const openModal = async () => {
        try {
            // Fazer uma requisição GET para a API que retorna o PDF
            const response = await fetch('/api', {
                method: 'GET',
            });
            const data = await response.json();
            console.log(data)
            setData(data);
            // Exibir o modal
            setModalVisible(true);
        } catch (error) {
            console.error('Erro ao fazer a visualização do PDF:', error);
        }
    };
    return (
        <div className="w-full flex items-center gap-4 p-4">
            <p
                style={{
                    marginRight: "auto",
                    color: "rgba(196, 48, 43, 1)",
                    fontSize: "30px",
                    fontWeight: "500",
                    fontStyle: "italic"
                }}
            >
                Decoupage
            </p>
            <Link
                href="/client"
                style={
                    pathname === "/client" ?
                        { borderBottom: "2px solid rgba(196, 48, 43, 1)", padding: "3px 8px" }
                        :
                        { borderBottom: "2px solid transparent", padding: "3px 8px" }
                }
            >
                Decupagem
            </Link>
            <Link
                href="/script"
                style={
                    pathname === "/script" ?
                        { borderBottom: "2px solid rgba(196, 48, 43, 1)", padding: "3px 8px" }
                        :
                        { borderBottom: "2px solid transparent", padding: "3px 8px" }
                }
            >
                Roteiro
            </Link>
            <input
                style={{
                    width: "280px",
                    marginLeft: "auto",
                    padding: "9px 12px",
                    backgroundColor: "rgba(201, 201, 201, 1)",
                    borderRadius: "6px",
                    outline: "none"
                }}
                placeholder="Projeto sem nome"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
            />
            <button
                style={{
                    position: 'relative',
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    backgroundColor: "white",
                    border: "1px solid rgba(76, 51, 170, 1)",
                    borderRadius: "8px"
                }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
            >
                <Image
                    aria-hidden
                    src="/eye.svg"
                    alt="Eye icon"
                    width={16}
                    height={16}
                    style={{ width: "16px", height: "16px" }}
                />
                <p>Visualizar</p>
                {dropdownOpen && (
                    <div style={{
                        width: '165px',
                        position: 'absolute',
                        top: '48px',
                        right: '-18px',
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        zIndex: '10',
                    }}>
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleView('classification-view');
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 16px 10px 16px', cursor: 'pointer', background: 'rgba(121, 116, 126, 0.1)' }}
                        >
                            <Image src={views['classification-view'] === 'show' ? 'eye2-on.svg' : 'eye2-off.svg'} alt="Descrição" width={22} height={22} style={{ width: "22px", height: "22px" }} />
                            <span style={{ fontSize: '16px' }}>Classificação</span>
                        </div>
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleView('description-view');
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 16px 10px 16px', cursor: 'pointer', background: 'rgba(121, 116, 126, 0.1)' }}
                        >
                            <Image src={views['description-view'] === 'show' ? 'eye2-on.svg' : 'eye2-off.svg'} alt="Descrição" width={22} height={22} style={{ width: "22px", height: "22px" }} />
                            <span style={{ fontSize: '16px' }}>Descrição</span>
                        </div>
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleView('takes-view');
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', background: 'rgba(121, 116, 126, 0.1)' }}
                        >
                            <Image src={views['takes-view'] === 'show' ? 'eye2-on.svg' : 'eye2-off.svg'} alt="Takes" width={22} height={22} style={{ width: "22px", height: "22px" }} />
                            <span style={{ fontSize: '16px' }}>Takes</span>
                        </div>
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleView('audios-view');
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', background: 'rgba(121, 116, 126, 0.1)' }}
                        >
                            <Image src={views['audios-view'] === 'show' ? 'eye2-on.svg' : 'eye2-off.svg'} alt="Audios" width={22} height={22} style={{ width: "22px", height: "22px" }} />
                            <span style={{ fontSize: '16px' }}>Audios</span>
                        </div>
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleView('audio-view');
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', background: 'rgba(121, 116, 126, 0.1)' }}
                        >
                            <Image src={views['audio-view'] === 'show' ? 'eye2-on.svg' : 'eye2-off.svg'} alt="Áudio" width={22} height={22} style={{ width: "22px", height: "22px" }} />
                            <span style={{ fontSize: '16px' }}>Áudio</span>
                        </div>
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleView('locution-view');
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px 16px 16px', cursor: 'pointer', background: 'rgba(121, 116, 126, 0.1)' }}
                        >
                            <Image src={views['locution-view'] === 'show' ? 'eye2-on.svg' : 'eye2-off.svg'} alt="Locução" width={22} height={22} style={{ width: "22px", height: "22px" }} />
                            <span style={{ fontSize: '16px' }}>Locução</span>
                        </div>
                    </div>
                )}
            </button>
            <button
                style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 16px",
                    gap: "8px",
                    color: "white",
                    backgroundColor: "rgba(76, 51, 170, 1)",
                    border: "1px solid transparent",
                    borderRadius: "8px"
                }}
                onClick={() => openModal()}
            >
                <Image
                    aria-hidden
                    src="/share.svg"
                    alt="Share icon"
                    width={16}
                    height={16}
                    style={{ width: "16px", height: "16px" }}
                />
                <p>Compartilhar</p>
            </button>
            {/* Modal de Visualização do PDF */}
            {modalVisible && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: '1000',
                }}>
                    <div className="modal-content" style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        width: '55vw',
                        height: '80vh',
                        overflow: 'auto',
                    }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderBottom: '1px solid rgb(158, 156, 168)',
                                padding: '16px'
                            }}
                        >
                            <p
                                style={{
                                    color: 'rgb(43, 35, 79)',
                                    fontSize: '20px',
                                    fontWeight: 800,
                                    lineHeight: '28px',
                                    letterSpacing: '0.5px',
                                }}
                            >
                                Compartilhar arquivos deste projeto
                            </p>
                            <button
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    fontSize: '32px',
                                    lineHeight: '32px',
                                    color: '#aaa',
                                    cursor: 'pointer',
                                }}
                                onClick={closeModal}
                            >
                                &times;
                            </button>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                padding: '24px'
                            }}
                        >
                            <p
                                style={{
                                    color: 'rgb(43, 35, 79)',
                                    fontSize: '20px',
                                    lineHeight: '20px',
                                    fontWeight: 800,
                                    letterSpacing: '0.5px',
                                    marginBottom: '6px'
                                }}
                            >
                                Baixar
                            </p>
                            {!showPreview &&
                                <>
                                    <div
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <p
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: 'rgb(43, 35, 79)',
                                                    fontSize: '16px',
                                                    letterSpacing: '0.5px',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                Roteiro
                                            </span>
                                            <span
                                                style={{
                                                    color: 'rgb(75, 71, 93)',
                                                    fontSize: '12px',
                                                    letterSpacing: '0.5px',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                PDF
                                            </span>
                                        </p>
                                        <Image
                                            aria-hidden
                                            src="/send.svg"
                                            alt="Send icon"
                                            width={24}
                                            height={24}
                                            style={{ width: "24px", height: "24px", cursor: 'pointer' }}
                                            onClick={() => setshowPreview('script')}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <p
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                color: 'rgb(43, 35, 79)',
                                                fontSize: '16px',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: 'rgb(43, 35, 79)',
                                                    fontSize: '16px',
                                                    letterSpacing: '0.5px',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                Decupagem
                                            </span>
                                            <span
                                                style={{
                                                    color: 'rgb(75, 71, 93)',
                                                    fontSize: '12px',
                                                    letterSpacing: '0.5px',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                PDF
                                            </span>
                                        </p>
                                        <Image
                                            aria-hidden
                                            src="/send.svg"
                                            alt="Send icon"
                                            width={24}
                                            height={24}
                                            style={{ width: "24px", height: "24px", cursor: 'pointer' }}
                                            onClick={() => setshowPreview('timecodes')}
                                        />
                                    </div>
                                </>
                            }
                            {showPreview === 'timecodes' &&
                                <div ref={contentRef}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'rgb(76, 51, 170', fontSize: '20px', lineHeight: '18px', fontWeight: 600, padding: '12px 8px', borderBottom: '1px solid rgb(158, 156, 168)' }}>
                                        <span>DECUPAGEM</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingRight: '12px' }}>
                                            <button>
                                                <Image
                                                    aria-hidden
                                                    src="/back.svg"
                                                    alt="Back icon"
                                                    width={24}
                                                    height={24}
                                                    style={{ width: "24px", height: "24px", cursor: 'pointer' }}
                                                    onClick={() => setshowPreview(null)}
                                                />
                                            </button>
                                            <button>
                                                <Image
                                                    aria-hidden
                                                    src="/download.svg"
                                                    alt="Download icon"
                                                    width={24}
                                                    height={24}
                                                    style={{ width: "24px", height: "24px", cursor: 'pointer' }}
                                                    onClick={() => setPdfController(true)}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ overflow: 'auto', maxHeight: 'calc(80vh - 201px)' }}>
                                        <div style={{ padding: '12px 8px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                            {data && data.timecodes && data.timecodes.filter(timecode => timecode.type).map((timecode, id) => {
                                                return (
                                                    <div key={id} style={{ border: '1px solid rgb(158, 158, 158)', borderRadius: '6px' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: "rgba(255, 255, 255)", borderRadius: '6px' }}>
                                                            <img
                                                                src={timecode.imageUrl}
                                                                style={{
                                                                    display: 'block',
                                                                    width: "100%",
                                                                    borderTopRightRadius: "6px",
                                                                    borderTopLeftRadius: "6px",
                                                                }}
                                                            />
                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-start', padding: '0 16px 8px 0' }}>
                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '6px',
                                                                        padding: "7px 8px",
                                                                        fontSize: '20px',
                                                                        lineHeight: '8px',
                                                                        fontWeight: '800',
                                                                        color: 'rgb(14, 11, 25)',
                                                                    }}
                                                                >
                                                                    {id + 1}
                                                                    <div style={{ width: '2px', height: '15px', backgroundColor: 'rgb(14, 11, 25)' }}></div>
                                                                    {timecode.type && timecode.type === "V" ?
                                                                        <Image
                                                                            aria-hidden
                                                                            src="/black-V.svg"
                                                                            alt="Vídeo icon"
                                                                            width={16}
                                                                            height={16}
                                                                            style={{ width: "16px", height: "16px", display: 'block' }}
                                                                        />
                                                                        : timecode.type === "A" ?
                                                                            <Image
                                                                                aria-hidden
                                                                                src="/black-A.svg"
                                                                                alt="Áudio icon"
                                                                                width={20}
                                                                                height={18}
                                                                                style={{ width: "20px", height: "18px", display: 'block' }}
                                                                            />
                                                                            : timecode.type === "AV" ?
                                                                                <Image
                                                                                    aria-hidden
                                                                                    src="/AV.svg"
                                                                                    alt="AV icon"
                                                                                    width={22}
                                                                                    height={20}
                                                                                    style={{ width: "22px", height: "20px", display: 'block' }}
                                                                                />
                                                                                :
                                                                                null
                                                                    }
                                                                </div>
                                                                <span
                                                                    style={{
                                                                        padding: "7px 8px",
                                                                        fontSize: '16px',
                                                                        lineHeight: '20px',
                                                                        fontWeight: '500',
                                                                        color: 'rgb(14, 11, 25)',
                                                                    }}
                                                                >
                                                                    {timecode.text}
                                                                </span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', padding: '2px 16px', fontSize: '12px', fontWeight: '600' }}>
                                                                <span>{formatTimecode(timecode.inTime)}</span>
                                                                <span>·</span>
                                                                <span>{formatTimecode(timecode.outTime)}</span>
                                                                <span>·</span>
                                                                <span style={{ backgroundColor: 'black', color: 'white', padding: '0 4px', borderRadius: '2px' }}>{formatTimecode(timecode.duration)}</span>
                                                            </div>
                                                            <div style={{ textAlign: 'end', padding: '2px 16px 16px 16px', fontSize: '12px', fontWeight: '500' }}>
                                                                {timecode.videoName}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            }
                            {showPreview === 'script' &&
                                <div ref={contentRef}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'rgb(76, 51, 170', fontSize: '20px', lineHeight: '18px', fontWeight: 600, padding: '12px 8px', borderBottom: '1px solid rgb(158, 156, 168)' }}>
                                        <span>ROTEIRO</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingRight: '12px' }}>
                                            <button>
                                                <Image
                                                    aria-hidden
                                                    src="/back.svg"
                                                    alt="Back icon"
                                                    width={24}
                                                    height={24}
                                                    style={{ width: "24px", height: "24px", cursor: 'pointer' }}
                                                    onClick={() => setshowPreview(null)}
                                                />
                                            </button>
                                            <button>
                                                <Image
                                                    aria-hidden
                                                    src="/download.svg"
                                                    alt="Download icon"
                                                    width={24}
                                                    height={24}
                                                    style={{ width: "24px", height: "24px", cursor: 'pointer' }}
                                                    onClick={() => setPdfController(true)}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ overflow: 'auto', maxHeight: 'calc(80vh - 201px)' }}>
                                        <div style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {data && data.script && data.script.map((script, id) => {
                                                console.log('script', script)
                                                return (
                                                    <div key={id} style={{ border: '1px solid #b4b4b4' }}>
                                                        <div style={{ display: "flex", justifyContent: 'space-between', backgroundColor: 'rgb(231, 231, 231)', padding: '16px', fontSize: '18px', lineHeight: '18px' }}>{script.name}</div>
                                                        {script.activeFields.length === 0 ?
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0' }}><span>Adicione <b>elementos</b> na cena e comece sua história!</span></div>
                                                            :
                                                            <div style={{ display: 'flex', gap: '16px', padding: '16px' }}>
                                                                <div style={{ flex: "1", display: 'flex', flexDirection: "column", gap: '8px' }}>
                                                                    {script.activeFields.includes('description') && views['description-view'] === 'show' &&
                                                                        <div style={{ padding: '12px', border: '0.5px solid rgb(18, 14, 35)', borderRadius: '4px' }}>
                                                                            <div style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '14px' }}>
                                                                                <Image src="/description.svg" alt="Descrição" width={18} height={18} style={{ width: '18px', height: '18px' }} />
                                                                            </div>
                                                                            <div style={{ display: 'inline-block', verticalAlign: 'middle', width: 'calc(100% - 32px)' }}>
                                                                                <ScriptInput
                                                                                    readOnly
                                                                                    placeholder="Descrição"
                                                                                    value={script.description}
                                                                                    onChange={value => changeScene(script, 'description', true, value)}
                                                                                    script={script}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                    {script.activeFields.includes('takes') && script.timecodes.filter(timecode => timecode.type === 'AV').length === 0 && views['takes-view'] === 'show' &&
                                                                        <div
                                                                            style={{ paddingTop: '4px' }}
                                                                        >
                                                                            {script.timecodes.length === 0 ?
                                                                                <div
                                                                                    className="grid"
                                                                                    id={`grid-scripts-${id}`}
                                                                                    style={{ position: 'relative', minHeight: '90px' }}
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
                                                                                >
                                                                                    {script.timecodes.map((timecode, scriptTimecodeId) => (
                                                                                        <div key={scriptTimecodeId} style={{ border: '1px solid rgb(158, 158, 158)', borderRadius: '6px' }}>
                                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: "rgba(255, 255, 255)", borderRadius: '6px' }}>
                                                                                                <img
                                                                                                    src={timecode.imageUrl}
                                                                                                    style={{
                                                                                                        display: 'block',
                                                                                                        width: "100%",
                                                                                                        borderTopRightRadius: "6px",
                                                                                                        borderTopLeftRadius: "6px",
                                                                                                    }}
                                                                                                />
                                                                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-start', padding: '0 16px 8px 0' }}>
                                                                                                    <div
                                                                                                        style={{
                                                                                                            display: 'flex',
                                                                                                            alignItems: 'center',
                                                                                                            gap: '6px',
                                                                                                            padding: "7px 8px",
                                                                                                            fontSize: '20px',
                                                                                                            lineHeight: '8px',
                                                                                                            fontWeight: '800',
                                                                                                            color: 'rgb(14, 11, 25)',
                                                                                                        }}
                                                                                                    >
                                                                                                        {id + 1}
                                                                                                        <div style={{ width: '2px', height: '15px', backgroundColor: 'rgb(14, 11, 25)' }}></div>
                                                                                                        {timecode.type && timecode.type === "V" ?
                                                                                                            <Image
                                                                                                                aria-hidden
                                                                                                                src="/black-V.svg"
                                                                                                                alt="Vídeo icon"
                                                                                                                width={16}
                                                                                                                height={16}
                                                                                                                style={{ width: "16px", height: "16px", display: 'block' }}
                                                                                                            />
                                                                                                            : timecode.type === "A" ?
                                                                                                                <Image
                                                                                                                    aria-hidden
                                                                                                                    src="/black-A.svg"
                                                                                                                    alt="Áudio icon"
                                                                                                                    width={20}
                                                                                                                    height={18}
                                                                                                                    style={{ width: "20px", height: "18px", display: 'block' }}
                                                                                                                />
                                                                                                                : timecode.type === "AV" ?
                                                                                                                    <Image
                                                                                                                        aria-hidden
                                                                                                                        src="/AV.svg"
                                                                                                                        alt="AV icon"
                                                                                                                        width={22}
                                                                                                                        height={20}
                                                                                                                        style={{ width: "22px", height: "20px", display: 'block' }}
                                                                                                                    />
                                                                                                                    :
                                                                                                                    null
                                                                                                        }
                                                                                                    </div>
                                                                                                    <span
                                                                                                        style={{
                                                                                                            padding: "7px 8px",
                                                                                                            fontSize: '16px',
                                                                                                            lineHeight: '20px',
                                                                                                            fontWeight: '500',
                                                                                                            color: 'rgb(14, 11, 25)',
                                                                                                        }}
                                                                                                    >
                                                                                                        {timecode.text}
                                                                                                    </span>
                                                                                                </div>
                                                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', padding: '2px 16px', fontSize: '12px', fontWeight: '600' }}>
                                                                                                    <span>{formatTimecode(timecode.inTime)}</span>
                                                                                                    <span>·</span>
                                                                                                    <span>{formatTimecode(timecode.outTime)}</span>
                                                                                                    <span>·</span>
                                                                                                    <span style={{ backgroundColor: 'black', color: 'white', padding: '0 4px', borderRadius: '2px' }}>{formatTimecode(timecode.duration)}</span>
                                                                                                </div>
                                                                                                <div style={{ textAlign: 'end', padding: '2px 16px 16px 16px', fontSize: '12px', fontWeight: '500' }}>
                                                                                                    {timecode.videoName}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            }
                                                                        </div>
                                                                    }
                                                                    {script.timecodes.map((timecode, scriptTimecodeId) => {
                                                                        if (timecode.type === 'AV') {
                                                                            return (
                                                                                <div key={scriptTimecodeId} style={{ border: '1px solid rgb(158, 158, 158)', borderRadius: '6px' }}>
                                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: "rgba(255, 255, 255)", borderRadius: '6px' }}>
                                                                                        <img
                                                                                            src={timecode.imageUrl}
                                                                                            style={{
                                                                                                display: 'block',
                                                                                                width: "100%",
                                                                                                borderTopRightRadius: "6px",
                                                                                                borderTopLeftRadius: "6px",
                                                                                            }}
                                                                                        />
                                                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-start', padding: '0 16px 8px 0' }}>
                                                                                            <div
                                                                                                style={{
                                                                                                    display: 'flex',
                                                                                                    alignItems: 'center',
                                                                                                    gap: '6px',
                                                                                                    padding: "7px 8px",
                                                                                                    fontSize: '20px',
                                                                                                    lineHeight: '8px',
                                                                                                    fontWeight: '800',
                                                                                                    color: 'rgb(14, 11, 25)',
                                                                                                }}
                                                                                            >
                                                                                                {id + 1}
                                                                                                <div style={{ width: '2px', height: '15px', backgroundColor: 'rgb(14, 11, 25)' }}></div>
                                                                                                {timecode.type && timecode.type === "V" ?
                                                                                                    <Image
                                                                                                        aria-hidden
                                                                                                        src="/black-V.svg"
                                                                                                        alt="Vídeo icon"
                                                                                                        width={16}
                                                                                                        height={16}
                                                                                                        style={{ width: "16px", height: "16px", display: 'block' }}
                                                                                                    />
                                                                                                    : timecode.type === "A" ?
                                                                                                        <Image
                                                                                                            aria-hidden
                                                                                                            src="/black-A.svg"
                                                                                                            alt="Áudio icon"
                                                                                                            width={20}
                                                                                                            height={18}
                                                                                                            style={{ width: "20px", height: "18px", display: 'block' }}
                                                                                                        />
                                                                                                        : timecode.type === "AV" ?
                                                                                                            <Image
                                                                                                                aria-hidden
                                                                                                                src="/AV.svg"
                                                                                                                alt="AV icon"
                                                                                                                width={22}
                                                                                                                height={20}
                                                                                                                style={{ width: "22px", height: "20px", display: 'block' }}
                                                                                                            />
                                                                                                            :
                                                                                                            null
                                                                                                }
                                                                                            </div>
                                                                                            <span
                                                                                                style={{
                                                                                                    padding: "7px 8px",
                                                                                                    fontSize: '16px',
                                                                                                    lineHeight: '20px',
                                                                                                    fontWeight: '500',
                                                                                                    color: 'rgb(14, 11, 25)',
                                                                                                }}
                                                                                            >
                                                                                                {timecode.text}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', padding: '2px 16px', fontSize: '12px', fontWeight: '600' }}>
                                                                                            <span>{formatTimecode(timecode.inTime)}</span>
                                                                                            <span>·</span>
                                                                                            <span>{formatTimecode(timecode.outTime)}</span>
                                                                                            <span>·</span>
                                                                                            <span style={{ backgroundColor: 'black', color: 'white', padding: '0 4px', borderRadius: '2px' }}>{formatTimecode(timecode.duration)}</span>
                                                                                        </div>
                                                                                        <div style={{ textAlign: 'end', padding: '2px 16px 16px 16px', fontSize: '12px', fontWeight: '500' }}>
                                                                                            {timecode.videoName}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        }
                                                                    })}
                                                                </div>
                                                                <div style={{ flex: "1", display: 'flex', flexDirection: "column", gap: '8px' }}>
                                                                    {script.activeFields.includes('audio') && views['audio-view'] === 'show' &&
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', border: '0.5px solid rgb(18, 14, 35)', borderRadius: '4px' }}>
                                                                            <Image src="/A.svg" alt="Áudio" width={18} height={18} style={{ width: "18px", height: "18px" }} />
                                                                            <ScriptInput readOnly placeholder='Áudio' value={script.audio} onChange={value => changeScene(script, 'audio', true, value)} script={script} />
                                                                        </div>
                                                                    }
                                                                    {script.activeFields.includes('locution') && views['locution-view'] === 'show' &&
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', border: '0.5px solid rgb(18, 14, 35)', borderRadius: '4px' }}>
                                                                            <Image src="/blue-microphone.svg" alt="Locução" width={18} height={18} style={{ width: "18px", height: "18px" }} />
                                                                            <ScriptInput readOnly placeholder='Locução' value={script.locution} onChange={value => changeScene(script, 'locution', true, value)} script={script} />
                                                                        </div>
                                                                    }
                                                                    {script.activeFields.includes('audios') && script.timecodes.filter(timecode => timecode.type === 'AV').length === 0 && views['audios-view'] === 'show' &&
                                                                        <div
                                                                            style={{ paddingTop: '4px' }}
                                                                        >
                                                                            {script.audios.length === 0 ?
                                                                                <div
                                                                                    className="grid grid-3"
                                                                                    id={`grid-audios-${id}`}
                                                                                    style={{ position: 'relative', minHeight: '90px' }}
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
                                                                                >
                                                                                    {script.audios.map((timecode, scriptAudioId) => {
                                                                                        return (
                                                                                            <div key={scriptAudioId} style={{ border: '1px solid rgb(158, 158, 158)', borderRadius: '6px' }}>
                                                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: "rgba(255, 255, 255)", borderRadius: '6px' }}>
                                                                                                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'flex-start', padding: '16px 16px 8px 16px' }}>
                                                                                                        <div
                                                                                                            style={{
                                                                                                                display: 'flex',
                                                                                                                alignItems: 'center',
                                                                                                                gap: '6px',
                                                                                                                fontSize: '20px',
                                                                                                                lineHeight: '8px',
                                                                                                                fontWeight: '800',
                                                                                                                color: 'rgb(14, 11, 25)',
                                                                                                            }}
                                                                                                        >
                                                                                                            {id + 1}
                                                                                                            <div style={{ width: '2px', height: '15px', backgroundColor: 'rgb(14, 11, 25)' }}></div>
                                                                                                            {timecode.type && timecode.type === "V" ?
                                                                                                                <Image
                                                                                                                    aria-hidden
                                                                                                                    src="/black-V.svg"
                                                                                                                    alt="Vídeo icon"
                                                                                                                    width={16}
                                                                                                                    height={16}
                                                                                                                    style={{ width: "16px", height: "16px", display: 'block' }}
                                                                                                                />
                                                                                                                : timecode.type === "A" ?
                                                                                                                    <Image
                                                                                                                        aria-hidden
                                                                                                                        src="/black-A.svg"
                                                                                                                        alt="Áudio icon"
                                                                                                                        width={20}
                                                                                                                        height={18}
                                                                                                                        style={{ width: "20px", height: "18px", display: 'block' }}
                                                                                                                    />
                                                                                                                    : timecode.type === "AV" ?
                                                                                                                        <Image
                                                                                                                            aria-hidden
                                                                                                                            src="/AV.svg"
                                                                                                                            alt="AV icon"
                                                                                                                            width={22}
                                                                                                                            height={20}
                                                                                                                            style={{ width: "22px", height: "20px", display: 'block' }}
                                                                                                                        />
                                                                                                                        :
                                                                                                                        null
                                                                                                            }
                                                                                                        </div>
                                                                                                        <span
                                                                                                            style={{
                                                                                                                fontSize: '16px',
                                                                                                                lineHeight: '20px',
                                                                                                                fontWeight: '500',
                                                                                                                color: 'rgb(14, 11, 25)',
                                                                                                            }}
                                                                                                        >
                                                                                                            {timecode.text}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', padding: '2px 16px', fontSize: '12px', fontWeight: '600' }}>
                                                                                                        <span>{formatTimecode(timecode.inTime)}</span>
                                                                                                        <span>·</span>
                                                                                                        <span>{formatTimecode(timecode.outTime)}</span>
                                                                                                        <span>·</span>
                                                                                                        <span style={{ backgroundColor: 'black', color: 'white', padding: '0 4px', borderRadius: '2px' }}>{formatTimecode(timecode.duration)}</span>
                                                                                                    </div>
                                                                                                    <div style={{ textAlign: 'end', padding: '2px 16px 16px 16px', fontSize: '12px', fontWeight: '500' }}>
                                                                                                        {timecode.videoName}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        )
                                                                                    })}
                                                                                </div>
                                                                            }
                                                                        </div>
                                                                    }
                                                                    {script.timecodes.map((timecode, scriptTimecodeId) => {
                                                                        if (timecode.type === 'AV') {
                                                                            console.log(timecode)
                                                                            return (
                                                                                <div key={scriptTimecodeId} style={{ border: '1px solid rgb(158, 158, 158)', borderRadius: '6px' }}>
                                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: "rgba(255, 255, 255)", borderRadius: '6px' }}>
                                                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-start', padding: '16px 16px 8px 16px' }}>
                                                                                            <div
                                                                                                style={{
                                                                                                    display: 'flex',
                                                                                                    alignItems: 'center',
                                                                                                    gap: '6px',
                                                                                                    padding: "7px 8px",
                                                                                                    fontSize: '20px',
                                                                                                    lineHeight: '8px',
                                                                                                    fontWeight: '800',
                                                                                                    color: 'rgb(14, 11, 25)',
                                                                                                }}
                                                                                            >
                                                                                                {id + 1}
                                                                                                <div style={{ width: '2px', height: '15px', backgroundColor: 'rgb(14, 11, 25)' }}></div>
                                                                                                {timecode.type && timecode.type === "V" ?
                                                                                                    <Image
                                                                                                        aria-hidden
                                                                                                        src="/black-V.svg"
                                                                                                        alt="Vídeo icon"
                                                                                                        width={16}
                                                                                                        height={16}
                                                                                                        style={{ width: "16px", height: "16px", display: 'block' }}
                                                                                                    />
                                                                                                    : timecode.type === "A" ?
                                                                                                        <Image
                                                                                                            aria-hidden
                                                                                                            src="/black-A.svg"
                                                                                                            alt="Áudio icon"
                                                                                                            width={20}
                                                                                                            height={18}
                                                                                                            style={{ width: "20px", height: "18px", display: 'block' }}
                                                                                                        />
                                                                                                        : timecode.type === "AV" ?
                                                                                                            <Image
                                                                                                                aria-hidden
                                                                                                                src="/AV.svg"
                                                                                                                alt="AV icon"
                                                                                                                width={22}
                                                                                                                height={20}
                                                                                                                style={{ width: "22px", height: "20px", display: 'block' }}
                                                                                                            />
                                                                                                            :
                                                                                                            null
                                                                                                }
                                                                                            </div>
                                                                                            <span
                                                                                                style={{
                                                                                                    padding: "7px 8px",
                                                                                                    fontSize: '16px',
                                                                                                    lineHeight: '20px',
                                                                                                    fontWeight: '500',
                                                                                                    color: 'rgb(14, 11, 25)',
                                                                                                }}
                                                                                            >
                                                                                                {timecode.text}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', padding: '2px 16px', fontSize: '12px', fontWeight: '600' }}>
                                                                                            <span>{formatTimecode(timecode.inTime)}</span>
                                                                                            <span>·</span>
                                                                                            <span>{formatTimecode(timecode.outTime)}</span>
                                                                                            <span>·</span>
                                                                                            <span style={{ backgroundColor: 'black', color: 'white', padding: '0 4px', borderRadius: '2px' }}>{formatTimecode(timecode.duration)}</span>
                                                                                        </div>
                                                                                        <div style={{ textAlign: 'end', padding: '2px 16px 16px 16px', fontSize: '12px', fontWeight: '500' }}>
                                                                                            {timecode.videoName}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        }
                                                                    })}
                                                                </div>
                                                            </div>
                                                        }
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}