import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Define paths for saving files locally
const dataFilePath = path.join(process.cwd(), 'public', 'data', 'data.json');
const imagesDirectory = path.join(process.cwd(), 'public', 'images');

// Helper function to ensure the data file exists
async function ensureDataFileExists() {
    try {
        // Verifica se o diretório "data" existe e cria se necessário
        await fs.mkdir(path.dirname(dataFilePath), { recursive: true });

        // Tenta acessar o arquivo, caso não exista, ele será criado com um array vazio
        await fs.access(dataFilePath);
    } catch (error) {
        // Se o arquivo não existir (erro ENOENT), cria um arquivo JSON vazio
        if (isNodeJsError(error) && error.code === 'ENOENT') {
            await fs.writeFile(dataFilePath, JSON.stringify([], null, 2));
        } else {
            throw error; // Relança outros erros
        }
    }
}

// Helper function to read JSON data from file
async function getExistingJsonFile() {
    await ensureDataFileExists(); // Garantir que o arquivo existe antes de ler
    try {
        const data = await fs.readFile(dataFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (isNodeJsError(error) && error.code === 'ENOENT') {
            // Se o arquivo não existe, retornar um array vazio
            return [];
        }
        throw error; // Relançar outros erros
    }
}

// Type guard para garantir que o erro é do tipo Node.js Error com 'code'
function isNodeJsError(error) {
    return error instanceof Error && 'code' in error;
}

// Helper function to write JSON data to file
async function writeJsonFile(data) {
    await ensureDataFileExists(); // Garantir que o arquivo existe antes de escrever
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

// Helper function to save image file locally
async function saveImageLocally(base64Data, fileName) {
    const buffer = Buffer.from(base64Data, 'base64');
    const filePath = path.join(imagesDirectory, fileName);

    await fs.mkdir(imagesDirectory, { recursive: true }); // Ensure the directory exists
    await fs.writeFile(filePath, buffer); // Save image file

    return `/images/${fileName}`; // Return relative path for frontend use
}

// Helper function to delete an image file
async function deleteImageLocally(fileName) {
    const filePath = path.join(imagesDirectory, fileName);
    try {
        await fs.unlink(filePath); // Remove o arquivo da imagem localmente
        console.log(`Imagem ${fileName} excluída com sucesso.`);
    } catch (error) {
        if (isNodeJsError(error) && error.code === 'ENOENT') {
            console.warn(`Imagem ${fileName} não encontrada, portanto, não foi excluída.`);
        } else {
            throw error; // Relançar outros erros
        }
    }
}

// Handle POST requests
export async function POST(request) {
    const body = await request.json();
    const { fileContent, timecode } = body;

    try {
        // Save the image locally
        const imageFileName = `${timecode.id}.jpg`; // Customize file name if needed
        const imageUrl = await saveImageLocally(fileContent, imageFileName);

        // Update the timecode with the new image URL
        timecode.imageUrl = imageUrl;

        // Read the existing data, append the new timecode, and save it
        const existingData = await getExistingJsonFile();
        var finalJson;
        if (existingData.length === 0) {
            finalJson = {
                "timecodes": [
                    timecode
                ],
                "script": []
            }
        } else {
            existingData["timecodes"].push(timecode);
            finalJson = existingData;
        }

        await writeJsonFile(finalJson);

        return NextResponse.json({
            message: 'Novo conjunto de dados e imagem adicionados com sucesso!',
            timecode,
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: 'Erro ao atualizar o arquivo JSON ou salvar a imagem',
                details: error.message,
            },
            { status: 500 }
        );
    }
}

// Handle GET requests
export async function GET() {
    try {
        const existingData = await getExistingJsonFile();

        return NextResponse.json(existingData);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao listar arquivos', details: error }, { status: 500 });
    }
}

// Handle PUT requests
// Handle PUT requests - Atualiza o conteúdo de um timecode no arquivo JSON
export async function PUT(request) {
    const { timecode, scope, script, json } = await request.json();

    console.log('scope', scope);
    console.log('timecode', timecode);
    console.log('script', script);

    if (!timecode && !script & !json) {
        return NextResponse.json({ error: 'ID ou dados do timecode/script não fornecidos' }, { status: 400 });
    }

    try {
        const existingData = await getExistingJsonFile();

        if (scope === "timecodes") {
            const itemIndex = existingData.timecodes.findIndex((item) => item.id === timecode.id);
            if (itemIndex === -1) {
                return NextResponse.json({ error: 'Timecode não encontrado em timecodes' }, { status: 404 });
            }

            existingData.timecodes[itemIndex] = {
                ...existingData.timecodes[itemIndex],
                ...timecode,
            };


            await writeJsonFile(existingData);
        } else if (scope === "script-timecodes") {
            let timecodeFound = false;

            existingData.script.forEach(scene => {
                const timecodeIndex = scene.timecodes.findIndex((tc) => tc.id === timecode.id);
                if (timecodeIndex !== -1) {
                    scene.timecodes[timecodeIndex] = {
                        ...scene.timecodes[timecodeIndex],
                        ...timecode,
                    };
                    timecodeFound = true;
                }
            });

            if (!timecodeFound) {
                return NextResponse.json({ error: 'Timecode não encontrado em script' }, { status: 404 });
            }


            await writeJsonFile(existingData);
        }  else if (scope === "script-audios") {
            let timecodeFound = false;

            existingData.script.forEach(scene => {
                const timecodeIndex = scene.audios.findIndex((tc) => tc.id === timecode.id);
                if (timecodeIndex !== -1) {
                    scene.audios[timecodeIndex] = {
                        ...scene.audios[timecodeIndex],
                        ...timecode,
                    };
                    timecodeFound = true;
                }
            });

            if (!timecodeFound) {
                return NextResponse.json({ error: 'Timecode não encontrado em script' }, { status: 404 });
            }


            await writeJsonFile(existingData);
        } else if (scope === "script" && script) {
            let scriptFound = false;

            existingData.script.forEach(scene => {
                if (scene.id === script.id) {
                    scene.activeFields = script.activeFields;
                    scene.description = script.description;
                    scene.audio = script.audio;
                    scene.locution = script.locution;
                    scriptFound = true;
                }
            });

            if (!scriptFound) {
                return NextResponse.json({ error: 'Script não encontrado' }, { status: 404 });
            }


            await writeJsonFile(existingData);
        } else if (scope === "timecode-move" && json) {
            console.log(json)

            await writeJsonFile(json);
        } else {
            return NextResponse.json({ error: 'Scope inválido' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Timecode atualizado com sucesso!', existingData });
    } catch (error) {
        return NextResponse.json({
            error: 'Erro ao atualizar o timecode',
            details: error.toString(),
        }, { status: 500 });
    }
}

// Handle DELETE requests
export async function DELETE(request) {
    const { id } = await request.json();

    if (!id) {
        return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    try {
        const existingData = await getExistingJsonFile();

        const updatedData = removeTimecode(id, existingData)

        console.log('updatedData', updatedData)
        
        if (!updatedData) {
            return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
        }


        // Escrever os dados atualizados no arquivo JSON
        await writeJsonFile(updatedData);

        // Excluir a imagem correspondente localmente
        const imageFileName = `${id}.jpg`; // Presumindo que a imagem tem esse padrão de nome
        await deleteImageLocally(imageFileName); // Chamar função para deletar a imagem

        return NextResponse.json({ message: 'Item deletado com sucesso!', updatedData });
    } catch (error) {
        return NextResponse.json({
            error: 'Erro ao deletar item ou imagem',
            details: error.message,
        }, { status: 500 });
    }
}

const removeTimecode = (id, data) => {
    // Tentar remover do array principal de timecodes
    const timecodeIndex = data.timecodes.findIndex((item) => item.id === id);
    if (timecodeIndex !== -1) {
        // Se encontrado, criar um novo array de timecodes sem o item
        return {
            ...data,
            timecodes: data.timecodes.filter((item) => item.id !== id)
        };
    }

    // Tentar remover do timecode de um script
    const updatedScripts = data.script.map(script => {
        const timecodeIndex = script.timecodes.findIndex((item) => item.id === id);
        if (timecodeIndex !== -1) {
            // Se encontrado, criar um novo array de timecodes para o script
            return {
                ...script,
                timecodes: script.timecodes.filter((item) => item.id !== id)
            };
        }
        return script; // Retorna o script original se não encontrar o timecode
    });

    // Retorna o objeto atualizado
    return {
        ...data,
        script: updatedScripts
    };
};