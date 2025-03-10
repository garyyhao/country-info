# Country Flag Finder

A web app that helps you find country flags using AI-powered descriptions or direct country name search.

## Features
- Search flags by description (e.g., "red with yellow stars")
- Search flags by country name
- View all country flags in a grid
- Beautiful, responsive design
- Real-time search results

## Setup

1. Clone this repository:
```bash
git clone https://github.com/garyyhao/country-info.git
cd country-info
```

2. Create your config file:
```bash
cp config.example.js config.js
```

3. Get an OpenAI API key:
   - Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key and paste it in `config.js`

4. Open the app:
   - Using Python: `python3 -m http.server 8000`
   - Or use any local server
   - Open http://localhost:8000 in your browser

## Usage

### AI Search
1. Click "Search by Description (AI)"
2. Type a description of a flag (e.g., "red with yellow stars")
3. Click Search or press Enter

### Direct Search
1. Click "Search by Country Name"
2. Start typing a country name
3. Results appear instantly as you type

## Technologies Used
- HTML5
- CSS3
- JavaScript (ES6+)
- OpenAI API
- REST Countries API 