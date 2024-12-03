"use client";

import { useState, useRef, useEffect } from 'react';
import Image from "next/image";
import { v4 as uuidv4 } from 'uuid';
import { formatTimecode, calculateDifference, fileToBase64, base64ToFile } from "@/utils/utils";

const VideoUploader = () => {
  const [currentTimecodeIn, setCurrentTimecodeIn] = useState(0);
  const [currentTimecodeOut, setCurrentTimecodeOut] = useState(0);
  const [currentTimecodeImage, setCurrentTimecodeImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videoName, setVideoName] = useState(null);
  const [videoSrc, setVideoSrc] = useState(undefined);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleVideoChange = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const videoURL = URL.createObjectURL(file);
      setVideoSrc(videoURL);
      setVideoName(file.name)
    }
  };

  const handleInClick = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      setCurrentTimecodeIn(currentTime);

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const image = canvas.toDataURL();
        setCurrentTimecodeImage(image);
      }
    }
  };

  const handleOutClick = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      setCurrentTimecodeOut(currentTime);
    }
  };

  const handleAddTimecode = async () => {
    setLoading(true);
    if (currentTimecodeIn !== null && currentTimecodeOut !== null && currentTimecodeImage) {
      const controlId = uuidv4();
      const newTimecode = {
        id: controlId,
        inTime: currentTimecodeIn,
        outTime: currentTimecodeOut,
        duration: calculateDifference(currentTimecodeIn, currentTimecodeOut),
        type: "",
        text: "",
        rating: 0,
        videoName,
      };

      try {
        const file = base64ToFile(currentTimecodeImage.split(',')[1], `${controlId}.jpg`);
        await uploadTimecode(file, newTimecode);
      } catch (error) {
        console.error('Erro ao enviar timecode para o servidor:', error);
      }

      setCurrentTimecodeIn(0);
      setCurrentTimecodeOut(0);
      setCurrentTimecodeImage(null);
      setLoading(false);
    }
  };

  const uploadTimecode = async (file, newTimecode) => {
    const fileContent = await fileToBase64(file);
    var requestBody = {
      fileContent,
      timecode: newTimecode
    };
    const response = await fetch('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    const data = await response.json();
    console.log(data)
    return data;
  };

  return (
    <div className="flex flex-col items-center flex-1  box-border" style={{ backgroundColor: "rgba(27, 27, 27, 1)", minHeight: "calc(100vh - 77px)" }}>
      <div className='flex items-center justify-center gap-6 w-full p-6'>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            backgroundColor: "rgba(48, 48, 48, 1)",
            borderRadius: "8px",
            color: "white"
          }}
        >
          <Image
            aria-hidden
            src="/import.svg"
            alt="Import project icon"
            width={24}
            height={24}
          />
          <p>Importar Projeto</p>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            backgroundColor: "rgba(48, 48, 48, 1)",
            borderRadius: "8px",
            color: "white"
          }}
        >
          <Image
            aria-hidden
            src="/import.svg"
            alt="Import vídeo icon"
            width={24}
            height={24}
          />
          <p>Importar Vídeo</p>
        </button>
        <input
          type="file"
          accept="video/*"
          ref={fileInputRef}
          onChange={handleVideoChange}
          className="hidden"
        />
      </div>
      {videoSrc && (
        <div className='p-4'>
          <video ref={videoRef} controls width="600" crossOrigin="anonymous">
            <source src={videoSrc} type="video/mp4" />
            Seu navegador não suporta vídeos.
          </video>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={handleInClick}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 12px", color: "white", fontWeight: "600", backgroundColor: "rgba(196, 48, 43, 1)", border: "2px solid rgba(196, 48, 43, 1)", borderRadius: "8px", }}
            >
              IN
            </button>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 12px", backgroundColor: "rgba(230, 224, 233, 0.12)", color: "rgba(255, 255, 255, 1)", borderRadius: "8px" }}>{formatTimecode(currentTimecodeIn)}</div>
            <button
              onClick={handleOutClick}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 12px", color: "rgba(196, 48, 43, 1)", fontWeight: "600", backgroundColor: "transparent", border: "2px solid rgba(196, 48, 43, 1)", borderRadius: "8px", }}
            >
              OUT
            </button>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 12px", backgroundColor: "rgba(230, 224, 233, 0.12)", color: "rgba(255, 255, 255, 1)", borderRadius: "8px" }}>{formatTimecode(currentTimecodeOut)}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 12px", marginLeft: "auto", backgroundColor: "rgba(230, 224, 233, 0.12)", color: "rgba(255, 255, 255, 1)", borderRadius: "8px" }}>{formatTimecode(calculateDifference(currentTimecodeIn, currentTimecodeOut))}</div>
          </div>
          <div className="w-full flex mt-4">
            {loading ?
              <div className="flex justify-center w-full">
                <Image
                  aria-hidden
                  src="/white-loading.svg"
                  alt="Loading Icon"
                  width={48}
                  height={48}
                  style={{ width: "48px", height: "48px" }}
                  priority
                />
              </div>
              :
              <button
                onClick={handleAddTimecode}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: !currentTimecodeIn || !currentTimecodeOut || !currentTimecodeImage ? 'rgba(169, 169, 169, 0.5)' : 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: !currentTimecodeIn || !currentTimecodeOut || !currentTimecodeImage ? 'not-allowed' : 'pointer',
                  opacity: !currentTimecodeIn || !currentTimecodeOut || !currentTimecodeImage ? 0.5 : 1,
                }}
                disabled={!currentTimecodeIn || !currentTimecodeOut || !currentTimecodeImage}
              >
                <Image
                  aria-hidden
                  src="/plus.svg"
                  alt="Globe icon"
                  width={18}
                  height={18}
                  style={{ width: "18px", height: "18px" }}
                />
                <b>Adicionar Take</b>
              </button>
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
