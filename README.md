# Music Downloader

A simple Electron application that allows you to search and download songs from Spotify.

## Features

- Search songs by name
- Display album cover
- Select download directory
- Download progress indicator
- Custom file naming with artist and song name

## Installation

1. Clone this repository:
```bash
git clone https://github.com/Itz-SuleX5/MusicDownloader.git
```

2. Install dependencies:
```bash
cd MusicDownloader
npm install
```

3. Start the application:
```bash
npm start
```

## How to Use

1. Click on the settings icon (⚙️) to select your download directory
2. Enter a song name in the search box
3. Click "Search" to find the song
4. Once found, the album cover and download button will appear
5. Click "Download" to start downloading the song

## Project Structure

```
MusicDownloader/
├── src/
│   ├── main/
│   │   └── main.js
│   └── renderer/
│       └── renderer.js
├── index.html
├── package.json
└── README.md
```

## Technologies Used

- Electron
- Node.js
- electron-dl
- axios

## License

ISC 