const axios = require('axios');

// Cache for 5 minutes to avoid hitting rate limits
let cachedJobs = null;
let cacheTime = null;
const CACHE_TTL = 5 * 60 * 1000;

const getJobs = async (req, res) => {
  const { role = 'developer', limit = 50 } = req.query;

  try {
    // Return cached jobs if fresh
    if (cachedJobs && cacheTime && Date.now() - cacheTime < CACHE_TTL) {
      const filtered = adaptiveFilter(cachedJobs, role);
      return res.json({ success: true, jobs: filtered.slice(0, parseInt(limit)), total: filtered.length, cached: true });
    }

    // Fetch from multiple sources for better coverage
    console.log(`📡 Fetching fresh jobs for role: ${role}...`);
    
    const fetchers = [
      axios.get('https://remotive.com/api/remote-jobs?limit=50', {
        headers: { 'Accept': 'application/json', 'User-Agent': 'CampusPath-AI/1.0' },
        timeout: 8000
      }),
      axios.get('https://www.arbeitnow.com/api/job-board-api', {
        headers: { 'Accept': 'application/json' },
        timeout: 8000
      })
    ];

    // Add JSearch (RapidAPI) if key is available
    const useRapid = process.env.RAPIDAPI_KEY && process.env.RAPIDAPI_KEY !== 'YOUR_RAPIDAPI_KEY_HERE';
    if (useRapid) {
      console.log(`💎 Including JSearch (RapidAPI) for "${role} in India"...`);
      fetchers.push(axios.get('https://jsearch.p.rapidapi.com/search', {
        params: { 
          query: `${role} in India`, // Targeted search for India
          num_pages: '1', 
          page: '1' 
        },
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || 'jsearch.p.rapidapi.com'
        },
        timeout: 10000
      }));
    }

    const results = await Promise.allSettled(fetchers);
    let combinedJobs = [];

    // 1. Process Remotive (Result at index 0)
    if (results[0].status === 'fulfilled' && results[0].value.data.jobs) {
      console.log(`✅ Remotive: Found ${results[0].value.data.jobs.length} jobs`);
      const normalizedRemotive = results[0].value.data.jobs.map(job => ({
        id: `rm-${job.id}`,
        title: job.title,
        company_name: job.company_name,
        candidate_required_location: job.candidate_required_location || 'Remote',
        url: job.url,
        tags: job.tags || [],
        description: job.description || '',
        publication_date: job.publication_date,
        salary: job.salary || 'Competitive',
        logo: job.company_logo || null
      }));
      combinedJobs = [...normalizedRemotive];
    } else {
      console.error('❌ Remotive failed:', results[0].reason?.message || results[0].status);
    }

    // 2. Process Arbeitnow (Result at index 1)
    if (results[1].status === 'fulfilled' && results[1].value.data.data) {
      console.log(`✅ Arbeitnow: Found ${results[1].value.data.data.length} jobs`);
      const normalizedArbeit = results[1].value.data.data.map(job => ({
        id: `an-${job.slug}`,
        title: job.title,
        company_name: job.company_name,
        candidate_required_location: job.location || (job.remote ? 'Remote' : 'Unknown'),
        url: job.url,
        tags: job.tags || [],
        description: job.description,
        publication_date: new Date(job.created_at * 1000).toISOString(),
        salary: 'Competitive',
        logo: job.company_logo || null
      }));
      combinedJobs = [...combinedJobs, ...normalizedArbeit];
    } else {
      console.error('❌ Arbeitnow failed:', results[1].reason?.message || results[1].status);
    }

    // 3. Process JSearch (Result at index 2, if it exists)
    if (useRapid && results[2]) {
      if (results[2].status === 'fulfilled' && results[2].value.data.data) {
        console.log(`✅ JSearch: Found ${results[2].value.data.data.length} jobs`);
        const normalizedJSearch = results[2].value.data.data.map(job => ({
          id: `js-${job.job_id}`,
          title: job.job_title,
          company_name: job.employer_name,
          candidate_required_location: job.job_city && job.job_country ? `${job.job_city}, ${job.job_country}` : 'Remote/Global',
          url: job.job_apply_link,
          tags: [job.job_employment_type, job.job_publisher].filter(Boolean),
          description: job.job_description,
          publication_date: job.job_posted_at_datetime_utc || new Date().toISOString(),
          salary: job.job_min_salary ? `${job.job_salary_currency || '$'}${job.job_min_salary} - ${job.job_max_salary}` : 'Competitive',
          logo: job.employer_logo || null
        }));
        combinedJobs = [...normalizedJSearch, ...combinedJobs];
      } else {
        console.error('❌ JSearch failed:', results[2].reason?.message || results[2].status);
        if (results[2].reason?.response?.data) {
          console.error('   Error Data:', JSON.stringify(results[2].reason.response.data));
        }
      }
    }

    // Merge Premium FAANG/MANGOS/TATA jobs at the top
    const premiumJobs = getPremiumBigTechJobs(role);
    combinedJobs = [...premiumJobs, ...combinedJobs];

    // If live APIs failed or returned nothing, append fallbacks so the list is rich
    if (combinedJobs.length <= premiumJobs.length) {
      const fallback = getFallbackJobs(role);
      combinedJobs = [...combinedJobs, ...fallback];
    }

    cachedJobs = combinedJobs;
    cacheTime = Date.now();

    const filtered = adaptiveFilter(cachedJobs, role);
    res.json({ success: true, jobs: filtered.slice(0, parseInt(limit)), total: filtered.length, cached: false });
  } catch (error) {
    console.error('Jobs fetch error:', error.message);
    // Return fallback curated jobs combined with premium jobs if fetch fails completely
    const fallback = getFallbackJobs(role);
    const premiumJobs = getPremiumBigTechJobs(role);
    const combinedFallback = [...premiumJobs, ...fallback];
    res.json({ success: true, jobs: combinedFallback, total: combinedFallback.length, fallback: true });
  }
};

function adaptiveFilter(jobs, role) {
  const primaryKeywords = role.toLowerCase().split(' ');
  let results = jobs.filter(job => {
    const title = job.title.toLowerCase();
    const desc = (job.description || '').toLowerCase().substring(0, 500);
    return primaryKeywords.some(kw => title.includes(kw) || desc.includes(kw));
  });

  // Adaptive Logic: If too few results, add broad "Developer" or "Software" results
  if (results.length < 15) {
    const broadKeywords = ['developer', 'software', 'engineer', 'web', 'fullstack', 'remote'];
    const additional = jobs.filter(job => {
      if (results.some(r => r.id === job.id)) return false; // Avoid duplicates
      const title = job.title.toLowerCase();
      return broadKeywords.some(kw => title.includes(kw));
    });
    results = [...results, ...additional.slice(0, 20)];
  }

  return results;
}

function getFallbackJobs(role) {
  const baseJobs = [
    { id: 'fb1', company_name: 'OpenAI', logo: 'https://logo.clearbit.com/openai.com', title: `Senior ${role} Engineer`, candidate_required_location: 'Remote', url: 'https://openai.com/careers', tags: ['AI', 'Python', 'React'], salary: '$130,000 - $200,000', publication_date: new Date().toISOString() },
    { id: 'fb2', company_name: 'Vercel', logo: 'https://logo.clearbit.com/vercel.com', title: `${role} Specialist`, candidate_required_location: 'Remote', url: 'https://vercel.com/careers', tags: ['Next.js', 'TypeScript', 'Node.js'], salary: '$120,000 - $180,000', publication_date: new Date().toISOString() },
    { id: 'fb3', company_name: 'GitHub', logo: 'https://logo.clearbit.com/github.com', title: `Platform Engineer (${role})`, candidate_required_location: 'Remote', url: 'https://github.com/about/careers', tags: ['Git', 'Go', 'PostgreSQL'], salary: '$115,000 - $165,000', publication_date: new Date().toISOString() },
    { id: 'fb4', company_name: 'Stripe', logo: 'https://logo.clearbit.com/stripe.com', title: `Solutions Architect`, candidate_required_location: 'Remote', url: 'https://stripe.com/jobs', tags: ['API', 'Ruby', 'Fintech'], salary: '$140,000 - $210,000', publication_date: new Date().toISOString() },
    { id: 'fb5', company_name: 'Discord', logo: 'https://logo.clearbit.com/discord.com', title: `Backend Systems Engineer`, candidate_required_location: 'Remote', url: 'https://discord.com/jobs', tags: ['Rust', 'Distributed Systems'], salary: '$135,000 - $190,000', publication_date: new Date().toISOString() },
    { id: 'fb6', company_name: 'Docker', logo: 'https://logo.clearbit.com/docker.com', title: `Cloud Infrastructure Engineer`, candidate_required_location: 'Remote', url: 'https://www.docker.com/careers', tags: ['Docker', 'Kubernetes', 'Go'], salary: '$125,000 - $175,000', publication_date: new Date().toISOString() },
    { id: 'fb7', company_name: 'Notion', logo: 'https://logo.clearbit.com/notion.so', title: `Product Engineer`, candidate_required_location: 'Remote', url: 'https://www.notion.so/careers', tags: ['React', 'TypeScript', 'Postgres'], salary: '$130,000 - $185,000', publication_date: new Date().toISOString() },
    { id: 'fb8', company_name: 'Figma', logo: 'https://logo.clearbit.com/figma.com', title: `Graphics Software Engineer`, candidate_required_location: 'Remote', url: 'https://www.figma.com/careers', tags: ['C++', 'Wasm', 'WebGL'], salary: '$150,000 - $220,000', publication_date: new Date().toISOString() },
    { id: 'fb9', company_name: 'Airbnb', logo: 'https://logo.clearbit.com/airbnb.com', title: `Full Stack Engineer`, candidate_required_location: 'Remote', url: 'https://careers.airbnb.com', tags: ['React', 'Java', 'Ruby'], salary: '$145,000 - $200,000', publication_date: new Date().toISOString() },
    { id: 'fb10', company_name: 'Postman', logo: 'https://logo.clearbit.com/postman.com', title: `Developer Relations Engineer`, candidate_required_location: 'Remote', url: 'https://www.postman.com/careers', tags: ['APIs', 'JS', 'Communication'], salary: '$110,000 - $160,000', publication_date: new Date().toISOString() },
    { id: 'fb11', company_name: 'Netlify', logo: 'https://logo.clearbit.com/netlify.com', title: `DX Engineer`, candidate_required_location: 'Remote', url: 'https://www.netlify.com/careers', tags: ['Serverless', 'Frameworks'], salary: '$120,000 - $170,000', publication_date: new Date().toISOString() },
    { id: 'fb12', company_name: 'Cloudflare', logo: 'https://logo.clearbit.com/cloudflare.com', title: `Edge Computing Developer`, candidate_required_location: 'Remote', url: 'https://www.cloudflare.com/careers', tags: ['Workers', 'Rust', 'Security'], salary: '$140,000 - $205,000', publication_date: new Date().toISOString() }
  ];
  return baseJobs;
}

function getPremiumBigTechJobs(role) {
  const normalizedRole = role.toLowerCase();
  
  // Custom tech stack/tags based on role search
  let skills = ['React', 'TypeScript', 'Node.js', 'System Design'];
  if (normalizedRole.includes('backend') || normalizedRole.includes('node') || normalizedRole.includes('python')) {
    skills = ['Go', 'Rust', 'Docker', 'Kubernetes', 'PostgreSQL', 'System Design'];
  } else if (normalizedRole.includes('devops') || normalizedRole.includes('cloud') || normalizedRole.includes('infra')) {
    skills = ['AWS', 'Terraform', 'Kubernetes', 'Docker', 'CI/CD', 'Linux'];
  } else if (normalizedRole.includes('android') || normalizedRole.includes('ios') || normalizedRole.includes('mobile')) {
    skills = ['Kotlin', 'Swift', 'React Native', 'Flutter', 'Mobile Architecture'];
  } else if (normalizedRole.includes('python') || normalizedRole.includes('ai') || normalizedRole.includes('ml')) {
    skills = ['Python', 'PyTorch', 'Large Language Models', 'TensorFlow', 'Vector DBs'];
  }

  // Capitalize role for displaying in titles
  const capitalizedRole = role.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Build specific career search URLs with the role keyword for direct application
  const encodedRole = encodeURIComponent(role);

  return [
    {
      id: 'prem-google-1',
      company_name: 'Google',
      logo: 'https://logo.clearbit.com/google.com',
      title: `${capitalizedRole} - Google Cloud & Workspace`,
      candidate_required_location: 'Bengaluru, India / Remote',
      url: `https://www.google.com/about/careers/applications/jobs/results/?q=${encodedRole}&location=India`,
      tags: [...skills, 'Algorithms'].slice(0, 5),
      description: `Join the Google Cloud core systems architecture team. You will build and scale reliable infrastructure supporting millions of concurrent operations globally, working alongside senior developers and architects.`,
      publication_date: new Date().toISOString(),
      salary: 'Competitive (INR)'
    },
    {
      id: 'prem-meta-1',
      company_name: 'Meta',
      logo: 'https://logo.clearbit.com/meta.com',
      title: `Senior ${capitalizedRole} - Threads & Instagram Core`,
      candidate_required_location: 'Remote, India',
      url: `https://www.metacareers.com/jobs?q=${encodedRole}&is_remote=true`,
      tags: [...skills, 'GraphQL'].slice(0, 5),
      description: `Meta is looking for a Senior Developer to collaborate on product features for Threads and Instagram core services. Experience in large-scale system designs, caching strategies, and data streams is highly desirable.`,
      publication_date: new Date().toISOString(),
      salary: 'Competitive'
    },
    {
      id: 'prem-netflix-1',
      company_name: 'Netflix',
      logo: 'https://logo.clearbit.com/netflix.com',
      title: `UI/UX ${capitalizedRole} - Streaming Engine`,
      candidate_required_location: 'Remote, Global',
      url: `https://jobs.netflix.com/search?q=${encodedRole}`,
      tags: [...skills, 'Streaming'].slice(0, 5),
      description: `We are seeking an engineer to join Netflix's core streaming user experience engineering team. Help optimize content delivery algorithms, fluid video layouts, and real-time client diagnostics.`,
      publication_date: new Date().toISOString(),
      salary: '$150,000 - $240,000'
    },
    {
      id: 'prem-amazon-1',
      company_name: 'Amazon',
      logo: 'https://logo.clearbit.com/amazon.com',
      title: `${capitalizedRole} - AWS Systems & EC2 Core`,
      candidate_required_location: 'Hyderabad, India / Remote',
      url: `https://www.amazon.jobs/en/search?base_query=${encodedRole}&loc_query=India`,
      tags: [...skills, 'AWS', 'Security'].slice(0, 5),
      description: `As a developer in the AWS EC2 systems core team, you will design, implement, and maintain security boundaries and execution environments for next-generation virtualized workloads.`,
      publication_date: new Date().toISOString(),
      salary: 'Competitive (INR)'
    },
    {
      id: 'prem-apple-1',
      company_name: 'Apple',
      logo: 'https://logo.clearbit.com/apple.com',
      title: `${capitalizedRole} - iCloud Services`,
      candidate_required_location: 'Hyderabad, India / Remote',
      url: `https://jobs.apple.com/en-us/search?search=${encodedRole}&sort=relevance`,
      tags: [...skills, 'iCloud'].slice(0, 5),
      description: `Shape the future of Apple iCloud. Join the services engineering group to design scalable storage engines, vector processing pipelines, and data sync mechanics.`,
      publication_date: new Date().toISOString(),
      salary: 'Competitive'
    },
    {
      id: 'prem-microsoft-1',
      company_name: 'Microsoft',
      logo: 'https://logo.clearbit.com/microsoft.com',
      title: `${capitalizedRole} - Azure AI Platforms`,
      candidate_required_location: 'Bengaluru, India / Remote',
      url: `https://careers.microsoft.com/us/en/search-results?keywords=${encodedRole}&l=India`,
      tags: [...skills, 'Azure', 'C#'].slice(0, 5),
      description: `Microsoft's Azure AI platforms team is hiring developers to build integration endpoints for large language models, runtime optimizations, and distributed inference engines.`,
      publication_date: new Date().toISOString(),
      salary: 'Competitive'
    },
    {
      id: 'prem-tcs-1',
      company_name: 'Tata Consultancy Services',
      logo: 'https://logo.clearbit.com/tcs.com',
      title: `Systems Consultant / Full-Stack ${capitalizedRole}`,
      candidate_required_location: 'Mumbai, India',
      url: `https://ibegin.tcs.com/iBegin/jobs/search?query=${encodedRole}`,
      tags: [...skills, 'Java', 'SQL'].slice(0, 5),
      description: `TCS is seeking systems consultants to design digital solutions for enterprise banking and logistics operations. You will define technical roadmaps and implement service-oriented structures.`,
      publication_date: new Date().toISOString(),
      salary: '₹800,000 - ₹1,500,000'
    },
    {
      id: 'prem-tatamotors-1',
      company_name: 'Tata Motors',
      logo: 'https://logo.clearbit.com/tatamotors.com',
      title: `Embedded software / ${capitalizedRole} - EV IoT Systems`,
      candidate_required_location: 'Pune, India',
      url: `https://careers.tatamotors.com/search-result?q=${encodedRole}`,
      tags: [...skills, 'Embedded', 'IoT'].slice(0, 5),
      description: `Join Tata Motors EV systems development unit. Work on telemetry diagnostics, IoT fleet sync architectures, and real-time charging controller algorithms.`,
      publication_date: new Date().toISOString(),
      salary: '₹900,000 - ₹1,650,000'
    }
  ];
}

const claimMilestone = async (req, res) => {
  const { milestoneId } = req.body;
  const xpMap = { 
    'global_1': 200, 'global_2': 350, 'global_3': 150, 'global_4': 2000,
  };
  
  try {
    const user = req.user;
    
    // Check if already claimed
    const alreadyClaimed = user.milestones?.find(m => m.id === milestoneId && m.claimed);
    if (alreadyClaimed) return res.status(400).json({ success: false, message: 'Milestone already claimed' });

    // Calculate XP (week milestones use id like 'week_1')
    let xpGain = 50;
    if (xpMap[milestoneId]) {
      xpGain = xpMap[milestoneId];
    } else if (milestoneId.startsWith('week_')) {
      const weekNum = parseInt(milestoneId.replace('week_', '')) || 1;
      xpGain = 500 + (weekNum * 50);
    }

    // Update streak and lastActiveDate
    const today = new Date().toDateString();
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    let newStreak = user.streak || 0;
    if (lastActive === yesterday) newStreak += 1;
    else if (lastActive !== today) newStreak = 1;

    // Upsert milestone in array
    const { User } = require('mongoose').models;
    const UserModel = require('../models/User');
    
    const existingMilestoneIdx = (user.milestones || []).findIndex(m => m.id === milestoneId);
    
    if (existingMilestoneIdx >= 0) {
      user.milestones[existingMilestoneIdx].claimed = true;
      user.milestones[existingMilestoneIdx].claimedAt = new Date();
    } else {
      user.milestones = [...(user.milestones || []), { id: milestoneId, claimed: true, claimedAt: new Date() }];
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      {
        $inc: { xp: xpGain },
        $set: {
          milestones: user.milestones,
          streak: newStreak,
          lastActiveDate: new Date()
        }
      },
      { new: true }
    );

    res.json({ success: true, xpGained: xpGain, newXP: updatedUser.xp, streak: newStreak, message: `+${xpGain} XP Earned!` });
  } catch (error) {
    console.error('Claim milestone error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getJobs, claimMilestone };
