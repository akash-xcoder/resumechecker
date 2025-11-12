const API_KEY = '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';
const API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

const resumeTextarea = document.getElementById('resumeText');
const checkBtn = document.getElementById('checkBtn');
const resultBox = document.getElementById('resultBox');
const resultContent = document.getElementById('resultContent');
const errorBox = document.getElementById('errorBox');
const errorContent = document.getElementById('errorContent');
const btnText = document.querySelector('.btn-text');
const btnLoader = document.querySelector('.btn-loader');

checkBtn.addEventListener('click', analyzeResume);

async function analyzeResume() {
    const resumeText = resumeTextarea.value.trim();

    // Validation
    if (!resumeText) {
        showError('Please paste your resume text before checking.');
        return;
    }

    if (resumeText.length < 50) {
        showError('Resume text is too short. Please provide more content.');
        return;
    }

    // Clear previous results
    hideError();
    hideResult();

    // Show loading state
    setLoading(true);

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert career advisor and resume consultant with 20+ years of experience. Provide detailed, actionable feedback on resumes.',
                    },
                    {
                        role: 'user',
                        content: `You are an expert career advisor. Analyze this resume and provide:
1. A score (0–100) for structure, clarity, and impact
2. Detailed suggestions for improvement
3. Specific strengths to highlight
4. Areas that need work

Resume:
${resumeText}`,
                    },
                ],
                temperature: 0.7,
                max_tokens: 1500,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.error?.message || `API Error: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response format from API');
        }

        const feedback = data.choices[0].message.content;
        displayResult(feedback);
    } catch (error) {
        console.error('Error:', error);
        showError(`Failed to analyze resume: ${error.message}`);
    } finally {
        setLoading(false);
    }
}

function displayResult(feedback) {
    resultContent.innerHTML = formatFeedback(feedback);
    showResult();
}

function formatFeedback(text) {
    // Convert markdown-like formatting to HTML
    let html = text
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^### (.*?)$/gm, '<h2>$1</h2>')
        .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
        .replace(/^# (.*?)$/gm, '<h2>$1</h2>');

    // Wrap in paragraph tags if not already wrapped
    if (!html.startsWith('<p>')) {
        html = '<p>' + html + '</p>';
    }

    return html;
}

function showResult() {
    resultBox.classList.remove('hidden');
    errorBox.classList.add('hidden');
}

function hideResult() {
    resultBox.classList.add('hidden');
}

function showError(message) {
    errorContent.textContent = message;
    errorBox.classList.remove('hidden');
    resultBox.classList.add('hidden');
}

function hideError() {
    errorBox.classList.add('hidden');
}

function setLoading(isLoading) {
    checkBtn.disabled = isLoading;
    if (isLoading) {
        btnText.textContent = 'Analyzing...';
        btnLoader.classList.remove('hidden');
    } else {
        btnText.textContent = 'Check Resume';
        btnLoader.classList.add('hidden');
    }
}

// Allow Enter key to submit (Ctrl+Enter)
resumeTextarea.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        checkBtn.click();
    }
});
