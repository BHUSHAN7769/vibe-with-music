const API_KEY = "gemini_api_key";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const analyzeBtn = document.getElementById('analyzeBtn');
const userInput = document.getElementById('userInput');
const loader = document.getElementById('loader');
const resultBox = document.getElementById('resultBox');
const aiResponse = document.getElementById('aiResponse');
const urgencyMeter = document.getElementById('urgencyMeter');
const moodEmoji = document.getElementById('moodEmoji');
const musicSuggestion = document.getElementById('musicSuggestion');
const playBtn = document.getElementById('playBtn');

analyzeBtn.addEventListener('click', async () => {
    const text = userInput.value.trim();
    if (!text) return alert("Write something first, friend.");

    loader.classList.remove('hidden');
    resultBox.classList.add('hidden');
    analyzeBtn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Input: "${text}".
                        Personality: 
                        - If romantic: Warm, charming partner. 
                        - If sad: Deeply empathetic and supportive.
                        - Else: Cheerful, calm, and insightful.
                        Rule: Suggest a specific song or piece of music that matches this mood.

                        Format:
                        SCORE: [1-100]
                        EMOJI: [One relevant emoji]
                        TEXT: [Your warm response]
                        MUSIC: [Song Name - Artist]`
                    }]
                }]
            })
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;

        const score = aiText.match(/SCORE:\s*(\d+)/i)?.[1] || 50;
        const emoji = aiText.match(/EMOJI:\s*(.+)/i)?.[1] || "☀️";
        const feedback = aiText.match(/TEXT:\s*([\s\S]+?)(?=MUSIC:|$)/i)?.[1] || aiText;
        const song = aiText.match(/MUSIC:\s*(.+)/i)?.[1] || "Alto's Adventure OST";

        displayResult(score, emoji, feedback, song);

    } catch (error) {
        aiResponse.innerText = "The connection drifted away. Let's try again.";
    } finally {
        loader.classList.add('hidden');
        analyzeBtn.disabled = false;
    }
});

function displayResult(score, emoji, feedback, song) {
    resultBox.classList.remove('hidden');
    moodEmoji.innerText = emoji.trim();
    aiResponse.innerText = feedback.trim();
    musicSuggestion.innerHTML = `<strong>Today's Soundtrack:</strong> ${song}`;
    
    playBtn.classList.remove('hidden');
    playBtn.onclick = () => {
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(song)}`, '_blank');
    };

    const numScore = parseInt(score);
    urgencyMeter.style.width = numScore + "%";
    
    // Alto Sunrise Palette
    if (numScore > 70) {
        urgencyMeter.style.background = "#386641"; // Deep Green
    } else if (numScore > 40) {
        urgencyMeter.style.background = "#bc4749"; // Earthy Red
    } else {
        urgencyMeter.style.background = "#6a994e"; // Sage Green
    }
}

function reset() {
    userInput.value = '';
    resultBox.classList.add('hidden');
}