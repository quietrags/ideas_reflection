# Ideas Analysis App

A powerful tool for analyzing and organizing ideas from text using AI. This application helps users extract and structure key ideas, relationships, analogies, and insights from any piece of text.

## Features

- **Core Ideas Extraction**: Identifies main ideas, supporting ideas, contextual elements, and counterpoints
- **Relationship Analysis**: Maps relationships between ideas and identifies different types of connections
- **Analogy Detection**: Extracts and explains analogies used in the text
- **Insight Generation**: Provides evolution of ideas, key takeaways, trade-offs, and broader themes

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **Backend**: FastAPI (Python)
- **AI Integration**: Groq API for text analysis
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Python 3.8+
- Groq API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ideas-app
```

2. Install frontend dependencies:
```bash
npm install
# or
yarn install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Set up environment variables:
Create a `.env` file in the backend directory:
```
GROQ_API_KEY=your_api_key_here
```

### Running the Application

1. Start the backend server:
```bash
cd backend
python main.py
```

2. In a new terminal, start the frontend development server:
```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Enter or paste your text in the editor
2. Click "Analyze" to process the text
3. View the structured analysis in the accordion panels:
   - Core Ideas
   - Relationships
   - Analogies
   - Insights

## Project Structure

```
ideas-app/
├── backend/              # FastAPI backend
│   ├── main.py          # Main server file
│   └── prompt.txt       # LLM prompt template
├── components/          # React components
├── lib/                # TypeScript utilities
├── pages/              # Next.js pages
└── styles/             # CSS styles
```

## License

MIT License - feel free to use this project for your own purposes.
