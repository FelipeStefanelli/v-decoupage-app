import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
    try {
        console.log('Gerando PDF...');
        const existingData = await getExistingJsonFile(); // Leitura do arquivo JSON
        const { script } = existingData;

        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 12;
        let page = pdfDoc.addPage([600, 800]); // Página do PDF
        let yPosition = 750; // Posição inicial do conteúdo na página

        // Função para adicionar uma nova página quando necessário
        const addNewPage = () => {
            page = pdfDoc.addPage([600, 800]);
            yPosition = 750; // Reiniciar a posição Y
        };

        // Função para carregar e exibir a imagem
        const loadImageToPDF = async (imagePath, pdfDoc, page, x, y, width, height) => {
            try {
                // Leitura assíncrona da imagem
                const imageBytes = await fs.readFile(imagePath);
                const image = await pdfDoc.embedPng(imageBytes);
                page.drawImage(image, { x, y, width, height });
            } catch (err) {
                console.error(`Erro ao carregar a imagem: ${imagePath}`, err);
            }
        };

        // Função para adicionar borda e destaque para cada cena
        const addSceneBorder = () => {
            page.drawRectangle({
                x: 20,
                y: yPosition + 10,
                width: 560,
                height: 10,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
            });
            yPosition -= 15;
        };

        // Iterar sobre cada cena do script de forma síncrona
        for (const scene of script) {
            if (yPosition <= 50) { // Adicionar uma nova página se necessário
                addNewPage();
            }

            // Adicionar a borda para separar cada cena
            addSceneBorder();

            // Título da cena em negrito
            page.drawText(`Cena: ${scene.name}`, { x: 50, y: yPosition, size: fontSize + 2, font: font, color: rgb(0, 0, 0) });
            yPosition -= 20;

            // Descrição da cena, se existir
            if (scene.description) {
                page.drawText(`Descrição:`, { x: 50, y: yPosition, size: fontSize, font: font, color: rgb(0, 0, 0) });
                page.drawText(`${scene.description}`, { x: 50, y: yPosition - 15, size: fontSize - 1, font: font, color: rgb(0.2, 0.2, 0.2) });
                yPosition -= 50;
            }

            // Locução da cena, se existir
            if (scene.locution) {
                page.drawText(`Locução:`, { x: 50, y: yPosition, size: fontSize, font: font, color: rgb(0, 0, 0) });
                page.drawText(`${scene.locution}`, { x: 50, y: yPosition - 15, size: fontSize - 1, font: font, color: rgb(0.2, 0.2, 0.2) });
                yPosition -= 50;
            }

            if (scene.audio) {
                page.drawText(`Áudio:`, { x: 50, y: yPosition, size: fontSize, font: font, color: rgb(0, 0, 0) });
                page.drawText(`${scene.audio}`, { x: 50, y: yPosition - 15, size: fontSize - 1, font: font, color: rgb(0.2, 0.2, 0.2) });
                yPosition -= 50;
            }

            // Exibir cada timecode da cena
            if (scene.timecodes && scene.timecodes.length > 0) {
                for (const timecode of scene.timecodes) {
                    if (yPosition <= 100) { // Adicionar uma nova página se necessário
                        addNewPage();
                    }

                    // Desenhar a borda para o timecode
                    page.drawRectangle({
                        x: 20,
                        y: yPosition - 10,
                        width: 560,
                        height: 120,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1,
                    });

                    // Colocar dados do timecode à esquerda e imagem à direita
                    page.drawText(`Timecode id: ${timecode.id}`, { x: 50, y: yPosition, size: fontSize, font: font, color: rgb(0, 0, 0) });
                    yPosition -= 20;
                    page.drawText(`Início: ${timecode.inTime}`, { x: 50, y: yPosition, size: fontSize, font: font, color: rgb(0, 0, 0) });
                    yPosition -= 20;
                    page.drawText(`Fim: ${timecode.outTime}`, { x: 50, y: yPosition, size: fontSize, font: font, color: rgb(0, 0, 0) });
                    yPosition -= 20;
                    page.drawText(`Duração: ${timecode.duration}`, { x: 50, y: yPosition, size: fontSize, font: font, color: rgb(0, 0, 0) });
                    yPosition -= 20;
                    page.drawText(`Texto: ${timecode.type === 'AV' ? 'A/V:' : ''} ${timecode.text}`, { x: 50, y: yPosition, size: fontSize, font: font, color: rgb(0, 0, 0) });
                    yPosition -= 20;
                    page.drawText(`Tipo: ${timecode.type}`, { x: 50, y: yPosition, size: fontSize, font: font, color: rgb(0, 0, 0) });
                    yPosition -= 20;

                    // Carregar e desenhar a imagem associada ao timecode à direita
                    const imagePath = path.join(process.cwd(), 'public', 'images', `${timecode.id}.jpg`);
                    console.log("Caminho da imagem:", imagePath);
                    const imageExists = await fs.access(imagePath).then(() => true).catch(() => false);

                    if (imageExists) {
                        // Colocar a imagem à direita
                        await loadImageToPDF(imagePath, pdfDoc, page, 330, yPosition - 100, 100, 100); 
                        yPosition -= 120; // Espaço para a imagem
                    }
                }
            }
        }

        // Gerar o PDF
        const pdfBytes = await pdfDoc.save();

        // Retornar o PDF como resposta
        return new NextResponse(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=script.pdf',
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao gerar o PDF', details: error }, { status: 500 });
    }
}

// Função para ler o arquivo JSON
async function getExistingJsonFile() {
    const dataFilePath = path.join(process.cwd(), 'public', 'data', 'data.json');
    try {
        const data = await fs.readFile(dataFilePath, 'utf-8');
        console.log("Dados do arquivo JSON carregados:", JSON.parse(data));  // Verificando os dados
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { script: [] };
        }
        throw error;
    }
}
