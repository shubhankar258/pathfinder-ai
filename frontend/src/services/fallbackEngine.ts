import {
  AdaptationEvent,
  AdaptationResponse,
  DAGData,
  LearnerProfile,
  QuizData,
  RoadmapItem,
  RoadmapResponse,
} from '../types';
import { ParseGoalResult } from './api';

export function parseGoalClient(goalRaw: string): ParseGoalResult {
  const text = goalRaw.trim().toLowerCase();

  let targetRole = 'Machine Learning Engineer';
  let targetSkill = 'ml_engineer_target';

  if (
    text.includes('cybersecurity') ||
    text.includes('security') ||
    text.includes('ethical hack') ||
    text.includes('penetration') ||
    text.includes('infosec') ||
    text.includes('soc')
  ) {
    targetRole = 'Cybersecurity Specialist';
    targetSkill = 'cybersecurity_engineer_target';
  } else if (
    text.includes('full stack') ||
    text.includes('fullstack') ||
    text.includes('web dev') ||
    text.includes('frontend') ||
    text.includes('backend') ||
    text.includes('react')
  ) {
    targetRole = 'Full-Stack Developer';
    targetSkill = 'fullstack_engineer_target';
  } else if (
    text.includes('devops') ||
    text.includes('cloud') ||
    text.includes('kubernetes') ||
    text.includes('docker')
  ) {
    targetRole = 'Cloud & DevOps Engineer';
    targetSkill = 'devops_engineer_target';
  } else if (text.includes('data science') || text.includes('data scientist')) {
    targetRole = 'Data Scientist';
    targetSkill = 'data_scientist_target';
  } else if (text.includes('nlp')) {
    targetRole = 'NLP Engineer';
    targetSkill = 'nlp_engineer_target';
  } else if (text.includes('computer vision') || text.includes('cv')) {
    targetRole = 'Computer Vision Engineer';
    targetSkill = 'cv_engineer_target';
  }

  let timelineWeeks = 24;
  if (text.includes('3 month') || text.includes('three month')) timelineWeeks = 12;
  else if (text.includes('6 month') || text.includes('six month')) timelineWeeks = 24;
  else if (text.includes('1 year') || text.includes('one year') || text.includes('12 month')) timelineWeeks = 52;
  else if (text.includes('9 month') || text.includes('nine month')) timelineWeeks = 36;

  const skillConfidence: Record<string, any> = {};
  let experienceLevel: string | undefined = undefined;

  if (text.includes('basic python') || text.includes('know python')) {
    skillConfidence['python_basics'] = 'FAMILIAR';
    experienceLevel = 'Basic Python';
  } else if (text.includes('intermediate python')) {
    skillConfidence['python_basics'] = 'DEVELOPING';
    experienceLevel = 'Intermediate Python';
  } else if (text.includes('know networking') || text.includes('basic networking')) {
    skillConfidence['network_fundamentals'] = 'FAMILIAR';
    experienceLevel = 'Basic Networking';
  } else if (text.includes('know linux') || text.includes('basic linux')) {
    skillConfidence['linux_administration'] = 'FAMILIAR';
    experienceLevel = 'Basic Linux';
  } else if (text.includes('know javascript') || text.includes('basic javascript') || text.includes('know js')) {
    skillConfidence['javascript_typescript'] = 'FAMILIAR';
    experienceLevel = 'Basic JavaScript';
  } else if (text.includes('beginner') || text.includes('never coded')) {
    experienceLevel = 'Beginner';
  }

  let weeklyHours: number | undefined = undefined;
  const hoursMatch = text.match(/(\d+)\s*(hrs|hours)/);
  if (hoursMatch) {
    weeklyHours = parseFloat(hoursMatch[1]);
  }

  let learningFormat: any = undefined;
  if (text.includes('hands-on') || text.includes('project') || text.includes('practical')) {
    learningFormat = 'hands_on';
  } else if (text.includes('interactive') || text.includes('quiz')) {
    learningFormat = 'interactive';
  } else if (text.includes('video') || text.includes('lecture')) {
    learningFormat = 'video';
  } else if (text.includes('reading') || text.includes('book')) {
    learningFormat = 'reading';
  }

  let interestDomain: string | undefined = undefined;
  if (text.includes('nlp') || text.includes('llm') || text.includes('language')) {
    interestDomain = 'NLP';
  } else if (text.includes('computer vision') || text.includes('vision')) {
    interestDomain = 'Computer Vision';
  } else if (text.includes('ethical hack') || text.includes('penetration')) {
    interestDomain = 'Ethical Hacking & Pen Testing';
  } else if (text.includes('soc') || text.includes('threat')) {
    interestDomain = 'SOC & Threat Analysis';
  } else if (text.includes('frontend') || text.includes('ui')) {
    interestDomain = 'Frontend & UI/UX';
  } else if (text.includes('backend') || text.includes('api')) {
    interestDomain = 'Backend & Microservices';
  } else if (text.includes('kubernetes') || text.includes('k8s')) {
    interestDomain = 'Kubernetes & Platform Eng';
  }

  const missingFields: string[] = [];
  if (weeklyHours === undefined) missingFields.push('weekly_hours');
  if (learningFormat === undefined) missingFields.push('learning_format');
  if (interestDomain === undefined) missingFields.push('interest_domain');

  return {
    profile: {
      target_role: targetRole,
      target_skill: targetSkill,
      timeline_weeks: timelineWeeks,
      experience_level: experienceLevel,
      learner_level: experienceLevel?.includes('Intermediate') ? 2 : 1,
      skill_confidence: skillConfidence,
      weekly_hours: weeklyHours,
      learning_format: learningFormat,
      interest_domain: interestDomain,
    },
    missing_fields: missingFields,
  };
}

export function generateRoadmapFallback(profile: LearnerProfile): RoadmapResponse {
  const isPythonFamiliar = profile.skill_confidence?.python_basics === 'FAMILIAR' || profile.skill_confidence?.python_basics === 'DEVELOPING';

  const items: RoadmapItem[] = [
    {
      skill_id: 'python_basics',
      skill_name: 'Python Programming Basics',
      phase: 1,
      state: 'AVAILABLE',
      confidence_tier: isPythonFamiliar ? 'FAMILIAR' : 'UNKNOWN',
      learning_mode: isPythonFamiliar ? 'REFRESHER' : 'FULL_MODULE',
      reason_codes: ['TARGET_SKILL', 'PREREQUISITE_OF_TARGET'],
      reasoning: 'Foundational syntax, data structures, and algorithmic logic for machine learning.',
      estimated_hours: isPythonFamiliar ? 8.0 : 16.0,
      is_refresher: isPythonFamiliar,
      is_exploratory: false,
      recommended_resource: {
        id: 'res_py_01',
        title: 'Python for Everybody Specialization',
        skills_taught: ['python_basics'],
        topics: ['functions', 'loops', 'data structures'],
        format: 'video',
        difficulty: 'BEGINNER',
        difficulty_level: 1,
        estimated_hours: 16.0,
        quality_score: 0.95,
        is_refresher: false,
        url: 'https://www.coursera.org/specializations/python',
        provider: 'Coursera',
      },
      score_breakdown: {
        difficulty_fit: 1.0,
        format_fit: 0.95,
        time_fit: 0.9,
        interest_alignment: 0.9,
        quality: 0.95,
        final_score: 0.94,
      },
    },
    {
      skill_id: 'math_linear_algebra',
      skill_name: 'Linear Algebra for Machine Learning',
      phase: 2,
      state: 'LOCKED',
      confidence_tier: 'UNKNOWN',
      learning_mode: 'FULL_MODULE',
      reason_codes: ['PREREQUISITE_OF_TARGET'],
      reasoning: 'Vectors, matrix multiplications, dot products, and transformations essential for neural networks.',
      estimated_hours: 20.0,
      is_refresher: false,
      is_exploratory: false,
      recommended_resource: {
        id: 'res_math_01',
        title: '3Blue1Brown - Essence of Linear Algebra',
        skills_taught: ['math_linear_algebra'],
        topics: ['vectors', 'matrices', 'eigenvalues'],
        format: 'video',
        difficulty: 'INTERMEDIATE',
        difficulty_level: 2,
        estimated_hours: 15.0,
        quality_score: 0.99,
        is_refresher: false,
        url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab',
        provider: 'YouTube / 3Blue1Brown',
      },
      score_breakdown: {
        difficulty_fit: 0.95,
        format_fit: 0.95,
        time_fit: 0.92,
        interest_alignment: 0.9,
        quality: 0.99,
        final_score: 0.942,
      },
    },
    {
      skill_id: 'statistics_probability',
      skill_name: 'Statistics & Probability',
      phase: 2,
      state: 'LOCKED',
      confidence_tier: 'UNKNOWN',
      learning_mode: 'FULL_MODULE',
      reason_codes: ['PREREQUISITE_OF_TARGET'],
      reasoning: 'Probability distributions, hypothesis testing, Bayes theorem, and statistical estimation.',
      estimated_hours: 22.0,
      is_refresher: false,
      is_exploratory: false,
      recommended_resource: {
        id: 'res_stat_01',
        title: 'StatQuest with Josh Starmer - Statistics Fundamentals',
        skills_taught: ['statistics_probability'],
        topics: ['p-values', 'distributions', 'normal distribution'],
        format: 'video',
        difficulty: 'INTERMEDIATE',
        difficulty_level: 2,
        estimated_hours: 18.0,
        quality_score: 0.98,
        is_refresher: false,
        url: 'https://www.youtube.com/c/joshstarmer',
        provider: 'StatQuest',
      },
      score_breakdown: {
        difficulty_fit: 0.95,
        format_fit: 0.9,
        time_fit: 0.95,
        interest_alignment: 0.9,
        quality: 0.98,
        final_score: 0.936,
      },
    },
    {
      skill_id: 'ml_fundamentals',
      skill_name: 'Machine Learning Algorithms & Optimization',
      phase: 3,
      state: 'LOCKED',
      confidence_tier: 'UNKNOWN',
      learning_mode: 'FULL_MODULE',
      reason_codes: ['TARGET_SKILL'],
      reasoning: 'Supervised and unsupervised models, loss surfaces, gradient descent, and cross-validation.',
      estimated_hours: 32.0,
      is_refresher: false,
      is_exploratory: false,
      recommended_resource: {
        id: 'res_ml_01',
        title: 'Machine Learning Specialization - Andrew Ng',
        skills_taught: ['ml_fundamentals'],
        topics: ['gradient descent', 'logistic regression', 'decision trees'],
        format: 'interactive',
        difficulty: 'INTERMEDIATE',
        difficulty_level: 2,
        estimated_hours: 30.0,
        quality_score: 0.99,
        is_refresher: false,
        url: 'https://www.coursera.org/specializations/machine-learning-introduction',
        provider: 'DeepLearning.AI / Coursera',
      },
      score_breakdown: {
        difficulty_fit: 0.98,
        format_fit: 0.95,
        time_fit: 0.9,
        interest_alignment: 0.95,
        quality: 0.99,
        final_score: 0.954,
      },
    },
    {
      skill_id: 'deep_learning',
      skill_name: 'Deep Learning & Neural Architectures',
      phase: 4,
      state: 'LOCKED',
      confidence_tier: 'UNKNOWN',
      learning_mode: 'FULL_MODULE',
      reason_codes: ['TARGET_SKILL'],
      reasoning: 'Backpropagation, CNNs, RNNs, attention mechanisms, and PyTorch implementations.',
      estimated_hours: 35.0,
      is_refresher: false,
      is_exploratory: false,
      recommended_resource: {
        id: 'res_dl_01',
        title: 'Deep Learning Specialization - DeepLearning.AI',
        skills_taught: ['deep_learning'],
        topics: ['backprop', 'PyTorch', 'transformers'],
        format: 'hands_on',
        difficulty: 'ADVANCED',
        difficulty_level: 3,
        estimated_hours: 35.0,
        quality_score: 0.98,
        is_refresher: false,
        url: 'https://www.deeplearning.ai/courses/deep-learning-specialization/',
        provider: 'DeepLearning.AI',
      },
      score_breakdown: {
        difficulty_fit: 0.95,
        format_fit: 1.0,
        time_fit: 0.88,
        interest_alignment: 0.95,
        quality: 0.98,
        final_score: 0.952,
      },
    },
    {
      skill_id: 'nlp_transformers',
      skill_name: 'Natural Language Processing & Transformers',
      phase: 5,
      state: 'LOCKED',
      confidence_tier: 'UNKNOWN',
      learning_mode: 'FULL_MODULE',
      reason_codes: ['SPECIALIZATION_BRANCH'],
      reasoning: 'Self-attention, Hugging Face transformers, fine-tuning LLMs, and RAG pipelines.',
      estimated_hours: 28.0,
      is_refresher: false,
      is_exploratory: false,
      recommended_resource: {
        id: 'res_nlp_01',
        title: 'Hugging Face NLP Course',
        skills_taught: ['nlp_transformers'],
        topics: ['Hugging Face', 'BERT', 'LLMs', 'RAG'],
        format: 'hands_on',
        difficulty: 'ADVANCED',
        difficulty_level: 3,
        estimated_hours: 28.0,
        quality_score: 0.99,
        is_refresher: false,
        url: 'https://huggingface.co/learn/nlp-course',
        provider: 'Hugging Face',
      },
      score_breakdown: {
        difficulty_fit: 0.95,
        format_fit: 1.0,
        time_fit: 0.9,
        interest_alignment: 1.0,
        quality: 0.99,
        final_score: 0.968,
      },
    },
  ];

  const totalHours = items.reduce((acc, curr) => acc + curr.estimated_hours, 0);
  const weeklyHours = profile.weekly_hours || 8.0;
  const baseWeeks = Math.ceil(totalHours / weeklyHours);

  return {
    roadmap: items,
    next_best_action: items[0],
    estimated_total_hours: totalHours,
    estimated_duration_range: {
      min_weeks: Math.max(1, Math.floor(baseWeeks * 0.9)),
      max_weeks: Math.ceil(baseWeeks * 1.2),
    },
    exploratory_topics: [
      { label: 'MLOps Pipeline Deployment', note: 'FastAPI model serving with Docker & Kubernetes' },
      { label: 'Vector Databases & LangChain', note: 'ChromaDB indexing with retrieval augmented generation' },
    ],
  };
}

export function adaptRoadmapFallback(
  event: AdaptationEvent,
  currentRoadmap: RoadmapItem[],
  _profile: LearnerProfile
): AdaptationResponse {
  const updated = currentRoadmap.map((item) => ({ ...item }));
  const targetIdx = updated.findIndex((i) => i.skill_id === event.skill_id);

  if (event.event_type === 'CHECKPOINT_FAILED' && targetIdx !== -1) {
    updated[targetIdx].learning_mode = 'REFRESHER';
    updated[targetIdx].confidence_tier = 'WEAK';
    updated[targetIdx].is_refresher = true;
    for (let i = targetIdx + 1; i < updated.length; i++) {
      if (updated[i].state === 'AVAILABLE') {
        updated[i].state = 'LOCKED';
      }
    }
    return {
      adaptation: {
        action: 'Triggered REFRESHER Mode',
        reason_codes: ['CHECKPOINT_FAILURE', 'LOW_CONFIDENCE'],
        reason: `Checkpoint score fell below threshold. Switched ${updated[targetIdx].skill_name} to REFRESHER mode and reinforced prerequisites.`,
        kept: updated.slice(0, targetIdx).map((i) => i.skill_id),
        changed: [updated[targetIdx].skill_id],
      },
      updated_roadmap: updated,
      next_best_action: updated[targetIdx],
    };
  }

  return {
    adaptation: {
      action: 'Adapted Learning Path',
      reason_codes: ['INTEREST_ALIGNMENT', 'DIFFICULTY_MATCH'],
      reason: 'Recalibrated learning path to match new interest domain and pace.',
      kept: updated.slice(0, 1).map((i) => i.skill_id),
      changed: updated.slice(1).map((i) => i.skill_id),
    },
    updated_roadmap: updated,
    next_best_action: updated[0],
  };
}

export function getQuizFallback(skillId: string): QuizData {
  return {
    skill_id: skillId,
    skill_name: skillId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    passing_score: 0.7,
    questions: [
      {
        id: 'q1',
        question: 'What is the primary purpose of cross-validation in machine learning?',
        options: [
          'To increase training speed on large datasets',
          'To assess model generalization and detect overfitting',
          'To eliminate the need for hyperparameter tuning',
          'To compress the model weights for edge deployment',
        ],
        correct_index: 1,
        explanation: 'Cross-validation splits the data into multiple train-validation folds to estimate out-of-sample generalization error and prevent overfitting.',
      },
      {
        id: 'q2',
        question: 'Which distribution is symmetric and defined entirely by its mean and variance?',
        options: ['Poisson distribution', 'Normal (Gaussian) distribution', 'Exponential distribution', 'Bernoulli distribution'],
        correct_index: 1,
        explanation: 'The Normal (Gaussian) distribution is completely characterized by its mean (μ) and variance (σ²), producing a bell-shaped curve.',
      },
    ],
  };
}

export function explainAssistantFallback(
  question: string,
  profile: LearnerProfile
): string {
  const q = question.toLowerCase();
  const role = profile.target_role || 'Machine Learning Engineer';

  if (q.includes('why') && (q.includes('stat') || q.includes('prob'))) {
    return 'Statistics & Probability is sequenced before Machine Learning Fundamentals because loss optimization, evaluation metrics (precision/recall), and probabilistic models depend directly on distributions and Bayes theorem.';
  }
  if (q.includes('why') && (q.includes('network') || q.includes('linux'))) {
    return 'Computer Networking and Linux Administration are foundational prerequisites because security penetration testing and cloud orchestration require inspecting packet headers and navigating system permissions.';
  }
  if (q.includes('time') || q.includes('busy') || q.includes('hours')) {
    return `At your current pace (${profile.weekly_hours || 8} hrs/week), each module timeline is dynamically scaled to fit milestone windows without skipping core prerequisites.`;
  }
  return `In your ${role} path, each skill is positioned deterministically based on prerequisite dependencies in the curated DAG. You can click any node to view detailed reasoning and resources.`;
}
