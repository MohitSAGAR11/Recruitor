import { callAI } from '../services/openrouter.service.js';
import { INTERVIEW_QUESTIONS_PROMPT } from '../services/prompts.js';

function generateFallbackQuestions(candidate, jd, scores) {
  const name = candidate.name || 'the candidate';
  const skills = candidate.skills || [];
  const workHistory = candidate.workHistory || [];
  const currentRole = candidate.currentRole || (workHistory[0]?.role) || 'Software Engineer';
  const lastCompany = workHistory[0]?.company || 'your previous employer';
  
  const techSkillsList = skills.slice(0, 5);
  const skill1 = techSkillsList[0] || 'software development';
  const skill2 = techSkillsList[1] || 'system design';

  // 1. Technical Questions (3 questions)
  const technicalQuestions = [
    {
      question: `Given your experience with ${skill1} at ${lastCompany}, how do you approach performance optimization and caching in production environments?`,
      rationale: `Probes practical, real-world application of ${skill1} in a production environment.`,
      difficulty: 'hard'
    },
    {
      question: `You listed both ${skill1} and ${skill2} in your profile. In what scenarios would you choose one over the other, and what are the key trade-offs to consider?`,
      rationale: `Evaluates depth of understanding and architectural decision-making between core technical competencies.`,
      difficulty: 'medium'
    },
    {
      question: `In your role as ${currentRole}, how do you ensure code quality, type safety, and comprehensive test coverage under tight deadlines?`,
      rationale: `Tests the candidate's engineering discipline, quality standards, and development workflows.`,
      difficulty: 'easy'
    }
  ];

  // 2. Behavioral Questions (3 questions)
  const behavioralQuestions = [
    {
      question: `Tell us about a time at ${lastCompany} where you had to work with a teammate or stakeholder who disagreed with your technical approach. How did you resolve the conflict?`,
      rationale: `Assesses conflict resolution, empathy, and professional communication.`,
      competency: 'Conflict Resolution & Teamwork'
    },
    {
      question: `Describe a project in your work history where the requirements were ambiguous or changed halfway through. How did you adapt and keep the project on track?`,
      rationale: `Measures adaptability, problem-solving, and resilience under uncertainty.`,
      competency: 'Adaptability & Execution'
    },
    {
      question: `As a ${currentRole}, how do you balance your day-to-day coding responsibilities with mentorship, knowledge sharing, or contributing to overall team productivity?`,
      rationale: `Evaluates leadership potential, collaborative mindset, and contribution to engineering culture.`,
      competency: 'Leadership & Mentorship'
    }
  ];

  // 3. Gap Probing Questions (3 questions)
  const gapProbingQuestions = [];
  const missingMustHaves = scores?.missingMustHave || [];
  
  if (missingMustHaves.length > 0) {
    gapProbingQuestions.push({
      question: `The job description emphasizes proficiency in ${missingMustHaves.join(', ')}, which wasn't fully highlighted in your CV. Can you share your level of exposure to these?`,
      rationale: `Evaluates capability to bridge the gap in missing core requirements.`,
      gap: `Missing Must-Haves: ${missingMustHaves.join(', ')}`
    });
  } else {
    gapProbingQuestions.push({
      question: `Although your background with ${skill1} is strong, how do you handle areas of the stack where you have less hands-on experience, such as system operations?`,
      rationale: `Probes candidate's resourcefulness and attitude towards learning unfamiliar parts of a stack.`,
      gap: 'Infrastructure/Full-Stack exposure'
    });
  }

  if (candidate.nonTraditionalBackground) {
    gapProbingQuestions.push({
      question: `Your profile highlights a non-traditional background (${candidate.nonTraditionalReason || 'unique career journey'}). How has this unique career path shaped your problem-solving style?`,
      rationale: `Probes the transition to tech and highlights candidate's unique strengths and resilience.`,
      gap: 'Non-traditional background'
    });
  } else {
    gapProbingQuestions.push({
      question: `Looking at your career trajectory, you transitioned from previous roles into your current role at ${lastCompany}. What was the biggest technical challenge during this transition?`,
      rationale: `Assesses career growth, adaptability, and self-learning capabilities.`,
      gap: 'Career transition friction'
    });
  }

  // Ensure exactly 3 questions
  if (gapProbingQuestions.length < 2) {
    gapProbingQuestions.push({
      question: `With ${candidate.totalYearsExperience || 2} years of experience, how do you determine when a task is ready to be delivered versus when it needs further design refinement?`,
      rationale: `Evaluates maturity, self-direction, and pragmatic decision-making.`,
      gap: 'Engineering maturity'
    });
  }
  gapProbingQuestions.push({
    question: `If selected for this role, what specific technical area or framework are you most excited to master during your first 90 days?`,
    rationale: `Uncovers learning goals, enthusiasm, and growth orientation.`,
    gap: 'Immediate learning curve'
  });

  // 4. Culture Questions (3 questions)
  const cultureQuestions = [
    {
      question: `What kind of engineering culture allows you to do your best work? Can you give an example of a practice or ritual that you found highly effective at ${lastCompany}?`,
      rationale: `Checks cultural alignment, team fit, and appreciation of developer experience.`
    },
    {
      question: `Our team values continuous feedback and peer reviews. How do you construct constructive feedback for peers, and how do you handle feedback that challenges your designs?`,
      rationale: `Probes openness to feedback, coachability, and growth mindset.`
    },
    {
      question: `How do you stay motivated and avoid burnout, especially when working in a fast-paced environment with competing priorities?`,
      rationale: `Assesses self-awareness, workload management, and long-term sustainability.`
    }
  ];

  return {
    technicalQuestions: technicalQuestions.slice(0, 3),
    behavioralQuestions: behavioralQuestions.slice(0, 3),
    gapProbingQuestions: gapProbingQuestions.slice(0, 3),
    cultureQuestions: cultureQuestions.slice(0, 3)
  };
}

/**
 * POST /api/interview/questions
 * Body: { candidate: parsedCV, jd: parsedJD, scores: scoreData }
 */
export async function generateInterviewQuestions(req, res) {
  const { candidate, jd, scores } = req.body;

  if (!candidate || !jd) {
    return res.status(400).json({
      success: false,
      error: 'Request body must include candidate (parsedCV) and jd (parsedJD).',
      code: 'MISSING_DATA',
    });
  }

  let questions;
  try {
    const payload = JSON.stringify({ candidate, jd, scores: scores || {} });
    questions = await callAI(INTERVIEW_QUESTIONS_PROMPT, payload);

    if (!questions || typeof questions !== 'object') {
      throw new Error('AI returned invalid formatted response');
    }
  } catch (err) {
    console.warn('[generateInterviewQuestions] AI call failed, falling back to programmatic questions generator:', err.message);
    questions = generateFallbackQuestions(candidate, jd, scores);
  }

  res.json({ success: true, data: questions });
}
