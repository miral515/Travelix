# Travelix

AI-powered travel planner that creates personalized trip itineraries based on your destination, budget, trip duration, number of travelers, and interests.

## Live Demo

https://travelix-ahz6.vercel.app/

## Features

- AI-generated personalized travel itineraries
- Budget breakdown including flights, hotels, food, transport, and activities
- AI trip optimization to improve the itinerary and reduce costs
- Regenerate individual days
- Hotel recommendations
- Google Maps integration
- Google Flights integration
- Estimated activity costs and times
- Export travel plans as PDF
- Responsive and user-friendly interface

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Groq API
- jsPDF
- Vercel

## How It Works

1. Enter your destination and trip details.
2. Select your budget, travel dates, number of travelers, and interests.
3. Travelix generates a personalized itinerary using AI.
4. Review your budget, hotel, activities, and daily schedule.
5. Optimize the trip or regenerate individual days if needed.
6. Export your final itinerary as a PDF.

## Project Structure

```text
travelix/
├── app/
│   ├── api/
│   ├── plan/
│   ├── result/
│   ├── components/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
├── .env.local
├── package.json
└── README.md
