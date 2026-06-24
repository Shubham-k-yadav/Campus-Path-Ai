const pdf = require('pdf-parse');
const { withKeyRotation } = require('./geminiKeyManager');

const analyzeResume = async (buffer, jobDescription) => {
  try {
    console.log('📄 Extracting text from PDF...');
    const data = await pdf(buffer);
    const resumeText = data.text?.trim();

    if (!resumeText || resumeText.length < 50) {
      throw new Error('Could not extract enough text from the PDF. Please ensure it is not an image-based PDF.');
    }

    console.log(`✅ Extracted ${resumeText.length} characters of resume text.`);

    const prompt = `
      You are an expert Technical Recruiter and ATS (Applicant Tracking System) Specialist.
      Analyze the following RESUME against the provided JOB DESCRIPTION.

      JOB DESCRIPTION:
      ${jobDescription}

      RESUME:
      ${resumeText}

      Return a JSON object with the following structure:
      {
        "score": (0-100),
        "matchExplanation": "brief overall summary",
        "missingKeywords": ["keyword1", "keyword2"],
        "improvementTips": ["tip1", "tip2"],
        "technicalGapAnalysis": "detailed analysis of skills missing for this specific role"
      }
      Only return the JSON object, no other text.
    `;

    const result = await withKeyRotation(async (genAI, modelName) => {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
      });
      const res = await model.generateContent(prompt);
      const text = res.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('AI failed to generate a valid analysis format.');
      const parsed = JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
      return {
        score: typeof parsed.score === 'number' ? parsed.score : 0,
        matchExplanation: parsed.matchExplanation || 'No summary available.',
        missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
        improvementTips: Array.isArray(parsed.improvementTips) ? parsed.improvementTips : [],
        technicalGapAnalysis: parsed.technicalGapAnalysis || 'No gap analysis available.'
      };
    });

    return result;

  } catch (error) {
    console.error('❌ Resume analysis service error:', error.message);
    throw new Error(error.message || 'Failed to analyze resume. Please try again.');
  }
};

const conductMockInterview = async ({ roadmapContext, messages, targetRole }) => {
  try {
    const systemPrompt = `
      You are an elite Senior Technical Interviewer for a Top Tier Tech Company.
      Your goal is to conduct a realistic, challenging, but encouraging mock technical interview.
      
      CONTEXT:
      - Target Role: ${targetRole || 'Software Engineer'}
      - User's Current Learning Path: ${JSON.stringify(roadmapContext || {})}
      
      INSTRUCTIONS:
      1. Start with a warm professional greeting if this is the first message.
      2. Ask ONE technical or behavioral question at a time related to their role and current roadmap progress.
      3. Evaluate their previous answer (if any) with constructive feedback before moving to the next question.
      4. Keep the tone professional, like a real job interview.
      
      CONVERSATION HISTORY:
      ${JSON.stringify(messages || [])}
    `;

    return await withKeyRotation(async (genAI, modelName) => {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(systemPrompt);
      return result.response.text();
    });

  } catch (error) {
    console.error('❌ Interview service error:', error);
    throw new Error('Interview simulation interrupted. Please check your connection and try again.');
  }
};

const generateBio = async ({ role, skills, experience, niche }) => {
  const prompt = `
    Generate a professional, compelling developer bio for a portfolio website.
    
    Context:
    - Role: ${role || 'Software Engineer'}
    - Skills: ${(skills || []).join(', ') || 'JavaScript, React, Node.js'}
    - Experience: ${experience || '2+ Years'}
    - Niche/Domain: ${niche || 'Web Development'}
    
    Requirements:
    - Write in FIRST PERSON
    - Keep it 2-3 sentences, max 60 words
    - Sound professional but approachable
    - Mention the role and key technologies naturally
    - Don't use clichés like "passionate" or "dedicated"
    - Make it unique and memorable
    
    Return ONLY the bio text, nothing else. No quotes around it.
  `;

  return await withKeyRotation(async (genAI, modelName) => {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    return result.response.text().trim().replace(/^[\"']|[\"']$/g, '');
  });
};

module.exports = { analyzeResume, conductMockInterview, generateBio };
