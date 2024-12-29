const axios = require('axios');
const { ipcRenderer } = require('electron');
const path = require('path');

let downloadUrl = '';
let currentSongData = null;
let downloadDirectory = '';

window.onload = () => {
    document.getElementById('downloadPath').textContent = 'No seleccionado';
    
    ipcRenderer.on('download-progress', (event, progress) => {
        const percent = Math.round(progress.percent * 100);
        document.getElementById('status').textContent = `Descargando: ${percent}%`;
    });
};

function openConfig() {
    document.getElementById('configModal').style.display = 'block';
}

function closeConfig() {
    document.getElementById('configModal').style.display = 'none';
}

async function selectDirectory() {
    try {
        const selectedPath = await ipcRenderer.invoke('select-directory');
        if (selectedPath) {
            downloadDirectory = selectedPath;
            document.getElementById('downloadPath').textContent = selectedPath;
            document.getElementById('status').textContent = 'Carpeta seleccionada correctamente';
        }
    } catch (error) {
        console.error('Error al seleccionar carpeta:', error);
        document.getElementById('status').textContent = 'Error al seleccionar la carpeta';
    }
}

async function searchSong() {
    const songName = document.getElementById('songInput').value;
    const statusElement = document.getElementById('status');
    const albumCover = document.getElementById('albumCover');
    const downloadButton = document.getElementById('downloadButton');

    if (!songName) {
        statusElement.textContent = 'Por favor, introduce el nombre de una canción';
        return;
    }

    statusElement.textContent = 'Buscando...';
    
    const options = {
        method: 'GET',
        url: 'https://spotify-scraper.p.rapidapi.com/v1/track/download/soundcloud',
        params: {
            track: songName,
            quality: 'sq'
        },
        headers: {
            'x-rapidapi-key': 'bb18653d4dmsh9763ddd8e0a6f76p1896cejsnb2c4604c6ecc',
            'x-rapidapi-host': 'spotify-scraper.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        console.log(response.data);

        if (response.data.status && response.data.soundcloudTrack) {
            currentSongData = response.data;
            
            if (response.data.spotifyTrack && response.data.spotifyTrack.album.cover) {
                const coverUrl = response.data.spotifyTrack.album.cover.find(c => c.width === 640)?.url;
                if (coverUrl) {
                    albumCover.src = coverUrl;
                    albumCover.style.display = 'block';
                }
            }

            downloadUrl = response.data.soundcloudTrack.audio[0].url;
            downloadButton.style.display = 'inline-block';
            statusElement.textContent = '¡Canción encontrada! Lista para descargar';
        } else {
            statusElement.textContent = 'No se encontró la canción';
            albumCover.style.display = 'none';
            downloadButton.style.display = 'none';
        }
    } catch (error) {
        console.error(error);
        statusElement.textContent = 'Error al buscar la canción';
        albumCover.style.display = 'none';
        downloadButton.style.display = 'none';
    }
}

function sanitizeFileName(fileName) {
    return fileName.replace(/[<>:"/\\|?*]/g, '_');
}

async function downloadSong() {
    if (!downloadUrl || !currentSongData) {
        document.getElementById('status').textContent = 'Error: Información de la canción no disponible';
        return;
    }

    if (!downloadDirectory) {
        document.getElementById('status').textContent = 'Error: Por favor, selecciona una carpeta de descarga en la configuración';
        return;
    }

    try {
        const songName = currentSongData.spotifyTrack.name;
        const artistName = currentSongData.spotifyTrack.artists[0].name;
        const fileName = sanitizeFileName(`${artistName} - ${songName}.mp3`);

        document.getElementById('status').textContent = 'Iniciando descarga...';

        await ipcRenderer.invoke('download-file', {
            url: downloadUrl,
            filename: fileName,
            directory: downloadDirectory
        });

        document.getElementById('status').textContent = `¡Descarga completada! Archivo guardado como: ${fileName}`;
    } catch (error) {
        console.error('Error al descargar:', error);
        document.getElementById('status').textContent = 'Error al descargar la canción: ' + error.message;
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('configModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
} 