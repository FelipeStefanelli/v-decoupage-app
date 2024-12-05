import React, { createContext, useState, useContext } from 'react';

// Defina as chaves para as visualizações que você quer controlar
const visibilityKeys = [
    'classification-view',
    'description-view',
    'takes-view',
    'audio-view',
    'locution-view',
    'audios-view'
];

// Criação do contexto
const VisibilityContext = createContext();

// Provider para fornecer o estado
export const VisibilityProvider = ({ children }) => {
    // Inicializa o estado de cada view como 'show'
    const [views, setViews] = useState(
        visibilityKeys.reduce((acc, key) => {
            acc[key] = 'show'; // Por padrão, todas as views começam com 'show'
            return acc;
        }, {})
    );

    // Função para alternar a visibilidade de uma chave
    const toggleView = (key) => {
        setViews((prevViews) => ({
            ...prevViews,
            [key]: prevViews[key] === 'show' ? 'hide' : 'show', // Alterna entre 'show' e 'hide'
        }));
    };

    return (
        <VisibilityContext.Provider value={{ views, toggleView }}>
            {children}
        </VisibilityContext.Provider>
    );
};

// Hook para acessar o contexto
export const useVisibility = () => useContext(VisibilityContext);
