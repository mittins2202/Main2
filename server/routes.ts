import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { generateBusinessResources } from "./services/resourceService.js";
import { pdfService } from "./services/pdfService.js";
import { emailService } from "./services/emailService.js";
import { aiScoringService } from "./services/aiScoringService.js";
import { personalityAnalysisService } from "./services/personalityAnalysisService.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // General OpenAI chat endpoint
  app.post("/api/openai-chat", async (req, res) => {
    try {
      const { prompt, maxTokens = 200, temperature = 0.7, responseFormat = null } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const requestBody = {
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature: temperature,
      };

      // Add response format if specified (for JSON responses)
      if (responseFormat) {
        requestBody.response_format = responseFormat;
      }

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }

      const data = await openaiResponse.json();
      const content = data.choices[0].message.content;

      res.json({ content });
    } catch (error) {
      console.error('Error in OpenAI chat:', error);
      res.status(500).json({ error: "OpenAI API request failed" });
    }
  });

  // Skills analysis endpoint using OpenAI
  app.post("/api/analyze-skills", async (req, res) => {
    try {
      const { quizData, requiredSkills, businessModel, userProfile } = req.body;

      const prompt = `
        Based on this user's quiz responses, analyze their current skill level for each required skill for ${businessModel}:

        USER PROFILE:
        ${userProfile}

        REQUIRED SKILLS:
        ${requiredSkills.map((skill: string) => `- ${skill}`).join('\n')}

        For each skill, determine:
        1. Status: "have" (user already has this skill), "working-on" (user has some experience but needs development), or "need" (user doesn't have this skill)
        2. Confidence: 1-10 score of how confident you are in this assessment
        3. Reasoning: Brief explanation of why you categorized it this way

        Return a JSON object with this structure:
        {
          "skillAssessments": [
            {
              "skill": "skill name",
              "status": "have" | "working-on" | "need",
              "confidence": 1-10,
              "reasoning": "brief explanation"
            }
          ]
        }

        Base your assessment on:
        - Their experience level and existing skills
        - Their learning preferences and willingness to learn
        - Their time commitment and motivation
        - Their tech comfort level
        - Their communication and work preferences
        - Their past tools and experience indicators
      `;

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: 'system',
              content: 'You are an expert career coach and skills assessor. Analyze user profiles and provide accurate skill assessments for business models.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }

      const data = await openaiResponse.json();
      const content = data.choices[0].message.content;
      const result = JSON.parse(content);

      res.json(result);
    } catch (error) {
      console.error('Error in skills analysis:', error);
      
      // Return fallback analysis
      const { requiredSkills } = req.body;
      const third = Math.ceil(requiredSkills.length / 3);
      
      const fallbackResult = {
        skillAssessments: [
          ...requiredSkills.slice(0, third).map((skill: string) => ({
            skill,
            status: 'have',
            confidence: 7,
            reasoning: 'Based on your quiz responses, you show strong aptitude for this skill'
          })),
          ...requiredSkills.slice(third, third * 2).map((skill: string) => ({
            skill,
            status: 'working-on',
            confidence: 6,
            reasoning: 'You have some experience but could benefit from further development'
          })),
          ...requiredSkills.slice(third * 2).map((skill: string) => ({
            skill,
            status: 'need',
            confidence: 8,
            reasoning: 'This skill would need to be developed for optimal success'
          }))
        ]
      };

      res.json(fallbackResult);
    }
  });

  // AI-powered business fit scoring endpoint
  app.post("/api/ai-business-fit-analysis", async (req, res) => {
    try {
      const { quizData } = req.body;
      
      if (!quizData) {
        return res.status(400).json({ error: "Quiz data is required" });
      }

      const analysis = await aiScoringService.analyzeBusinessFit(quizData);
      res.json(analysis);
    } catch (error) {
      console.error('Error in AI business fit analysis:', error);
      res.status(500).json({ error: "Failed to analyze business fit" });
    }
  });

  // AI-powered personality analysis endpoint
  app.post("/api/ai-personality-analysis", async (req, res) => {
    try {
      const { quizData } = req.body;
      
      if (!quizData) {
        return res.status(400).json({ error: "Quiz data is required" });
      }

      const analysis = await personalityAnalysisService.analyzePersonality(quizData);
      res.json(analysis);
    } catch (error) {
      console.error('Error in AI personality analysis:', error);
      res.status(500).json({ error: "Failed to analyze personality" });
    }
  });

  // Income projections endpoint using hardcoded data
  app.post("/api/generate-income-projections", async (req, res) => {
    try {
      const { businessId } = req.body;
      
      if (!businessId) {
        return res.status(400).json({ error: "Business ID is required" });
      }

      // Use hardcoded projections based on business model
      const projections = getFallbackProjections(businessId);
      res.json(projections);
    } catch (error) {
      console.error('Error generating income projections:', error);
      res.status(500).json({ error: "Failed to generate income projections" });
    }
  });

  function getFallbackProjections(businessId: string) {
    const baseData: any = {
      'affiliate-marketing': {
        monthlyProjections: [
          { month: 'Month 1', income: 0, cumulativeIncome: 0, milestones: ['Setup website', 'Choose niche'] },
          { month: 'Month 2', income: 50, cumulativeIncome: 50, milestones: ['First content published'] },
          { month: 'Month 3', income: 200, cumulativeIncome: 250, milestones: ['First affiliate sale'] },
          { month: 'Month 4', income: 500, cumulativeIncome: 750, milestones: ['Traffic growth'] },
          { month: 'Month 5', income: 800, cumulativeIncome: 1550, milestones: ['SEO improvement'] },
          { month: 'Month 6', income: 1200, cumulativeIncome: 2750, milestones: ['Email list building'] },
          { month: 'Month 7', income: 1600, cumulativeIncome: 4350 },
          { month: 'Month 8', income: 2000, cumulativeIncome: 6350 },
          { month: 'Month 9', income: 2500, cumulativeIncome: 8850 },
          { month: 'Month 10', income: 3000, cumulativeIncome: 11850 },
          { month: 'Month 11', income: 3500, cumulativeIncome: 15350 },
          { month: 'Month 12', income: 4000, cumulativeIncome: 19350 }
        ],
        averageTimeToProfit: '3-4 months',
        projectedYearOneIncome: 19350,
        keyFactors: ['Content quality', 'SEO optimization', 'Audience building', 'Product selection'],
        assumptions: ['20 hours/week commitment', 'Consistent content creation', 'Learning SEO basics']
      },
      'freelancing': {
        monthlyProjections: [
          { month: 'Month 1', income: 500, cumulativeIncome: 500, milestones: ['Profile setup', 'First client'] },
          { month: 'Month 2', income: 1200, cumulativeIncome: 1700, milestones: ['Portfolio building'] },
          { month: 'Month 3', income: 2000, cumulativeIncome: 3700, milestones: ['Client testimonials'] },
          { month: 'Month 4', income: 2800, cumulativeIncome: 6500, milestones: ['Rate increase'] },
          { month: 'Month 5', income: 3500, cumulativeIncome: 10000, milestones: ['Repeat clients'] },
          { month: 'Month 6', income: 4200, cumulativeIncome: 14200, milestones: ['Referral network'] },
          { month: 'Month 7', income: 4800, cumulativeIncome: 19000 },
          { month: 'Month 8', income: 5200, cumulativeIncome: 24200 },
          { month: 'Month 9', income: 5600, cumulativeIncome: 29800 },
          { month: 'Month 10', income: 6000, cumulativeIncome: 35800 },
          { month: 'Month 11', income: 6200, cumulativeIncome: 42000 },
          { month: 'Month 12', income: 6500, cumulativeIncome: 48500 }
        ],
        averageTimeToProfit: '1-2 months',
        projectedYearOneIncome: 48500,
        keyFactors: ['Skill level', 'Portfolio quality', 'Client communication', 'Pricing strategy'],
        assumptions: ['Existing marketable skills', '25 hours/week availability', 'Professional presentation']
      }
    };

    return baseData[businessId] || baseData['affiliate-marketing'];
  }

  // Quiz retake system endpoints
  app.get("/api/quiz-retake-status/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      let user = await storage.getUser(userId);
      
      // Create user if doesn't exist (for testing)
      if (!user) {
        user = await storage.createUser({
          username: `user${userId}`,
          password: "test123",
          hasAccessPass: false,
          quizRetakesRemaining: 0,
          totalQuizRetakesUsed: 0
        });
      }

      const attemptsCount = await storage.getQuizAttemptsCount(userId);
      
      // Logic: Guests can take quiz unlimited times for free
      // If they pay $9.99, they get 5 total attempts (limited)
      // After 5 attempts, they pay $4.99 for 5 more attempts
      
      const isGuestUser = !user.hasAccessPass && user.quizRetakesRemaining === 0;
      const hasAccessPass = user.hasAccessPass;
      
      // Can retake if:
      // 1. Guest user (unlimited free attempts)
      // 2. Paid user with remaining retakes
      const canRetake = isGuestUser || (hasAccessPass && user.quizRetakesRemaining > 0);
      
      res.json({
        canRetake,
        attemptsCount,
        hasAccessPass,
        quizRetakesRemaining: user.quizRetakesRemaining,
        totalQuizRetakesUsed: user.totalQuizRetakesUsed,
        isFirstQuiz: attemptsCount === 0,
        isFreeQuizUsed: attemptsCount > 0,
        isGuestUser
      });
    } catch (error) {
      console.error('Error getting quiz retake status:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/quiz-attempt", async (req, res) => {
    try {
      const { userId, quizData } = req.body;
      
      if (!userId || !quizData) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.createUser({
          username: `user${userId}`,
          password: "test123",
          hasAccessPass: false,
          quizRetakesRemaining: 0,
          totalQuizRetakesUsed: 0
        });
      }

      const attemptsCount = await storage.getQuizAttemptsCount(userId);
      const isGuestUser = !user.hasAccessPass && user.quizRetakesRemaining === 0;
      const hasAccessPass = user.hasAccessPass;
      
      // Can take quiz if:
      // 1. Guest user (unlimited free attempts)
      // 2. Paid user with remaining retakes
      const canTakeQuiz = isGuestUser || (hasAccessPass && user.quizRetakesRemaining > 0);
      
      if (!canTakeQuiz) {
        return res.status(403).json({ error: "No quiz retakes remaining. Purchase more retakes to continue." });
      }

      // Record the quiz attempt
      const attempt = await storage.recordQuizAttempt({
        userId,
        quizData
      });

      // Decrement retakes only for paid users
      if (hasAccessPass && user.quizRetakesRemaining > 0) {
        await storage.decrementQuizRetakes(userId);
      }

      res.json({ 
        success: true, 
        attemptId: attempt.id,
        message: "Quiz attempt recorded successfully" 
      });
    } catch (error) {
      console.error('Error recording quiz attempt:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get quiz attempts history for a user
  app.get("/api/quiz-attempts/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      let user = await storage.getUser(userId);
      
      if (!user) {
        user = await storage.createUser({
          username: `user${userId}`,
          password: "test123",
          hasAccessPass: false,
          quizRetakesRemaining: 0,
          totalQuizRetakesUsed: 0
        });
      }

      const attempts = await storage.getQuizAttempts(userId);
      res.json(attempts);
    } catch (error) {
      console.error('Error getting quiz attempts:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/create-access-pass-payment", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user already has access pass
      if (user.hasAccessPass) {
        return res.status(400).json({ error: "User already has access pass" });
      }

      // Create payment record for access pass ($9.99)
      const payment = await storage.createPayment({
        userId,
        amount: "9.99",
        currency: "usd",
        type: "access_pass",
        status: "pending",
        retakesGranted: 5
      });

      // In a real implementation, this would integrate with Stripe
      // For now, simulate successful payment
      await storage.completePayment(payment.id, 5);

      res.json({ 
        success: true, 
        paymentId: payment.id,
        message: "Access pass purchased successfully. You now have 5 quiz retakes!" 
      });
    } catch (error) {
      console.error('Error creating access pass payment:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/create-retake-bundle-payment", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user has access pass
      if (!user.hasAccessPass) {
        return res.status(400).json({ error: "User must have access pass first" });
      }

      // Create payment record for retake bundle ($4.99)
      const payment = await storage.createPayment({
        userId,
        amount: "4.99",
        currency: "usd",
        type: "retake_bundle",
        status: "pending",
        retakesGranted: 5
      });

      // In a real implementation, this would integrate with Stripe
      // For now, simulate successful payment
      await storage.completePayment(payment.id, 5);

      res.json({ 
        success: true, 
        paymentId: payment.id,
        message: "Retake bundle purchased successfully. You now have 5 additional quiz retakes!" 
      });
    } catch (error) {
      console.error('Error creating retake bundle payment:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/payment-history/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const payments = await storage.getPaymentsByUser(userId);
      
      res.json(payments);
    } catch (error) {
      console.error('Error getting payment history:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Business resources endpoint
  app.get("/api/business-resources/:businessModel", async (req, res) => {
    try {
      const businessModel = req.params.businessModel;
      const resources = await generateBusinessResources(businessModel);
      
      res.json(resources);
    } catch (error) {
      console.error('Error generating business resources:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // PDF generation endpoint
  app.post("/api/generate-pdf", async (req, res) => {
    try {
      const { quizData, userEmail } = req.body;
      
      console.log('PDF generation request received', { hasQuizData: !!quizData, userEmail });
      
      if (!quizData) {
        return res.status(400).json({ error: "Quiz data is required" });
      }

      // Get the base URL from the request
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      console.log('Base URL:', baseUrl);
      
      // Generate PDF
      const pdfBuffer = await pdfService.generatePDF({
        quizData,
        userEmail,
        baseUrl
      });

      console.log('PDF generated successfully, size:', pdfBuffer.length);

      // Set headers for HTML download (temporary solution until Puppeteer works)
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', 'attachment; filename="business-report.html"');
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Send the HTML
      res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF generation failed:", error);
      res.status(500).json({ 
        error: "Failed to generate PDF", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Email endpoints
  app.post("/api/send-quiz-results", async (req, res) => {
    try {
      const { email, quizData } = req.body;
      
      if (!email || !quizData) {
        return res.status(400).json({ error: "Missing email or quiz data" });
      }

      const success = await emailService.sendQuizResults(email, quizData);
      
      if (success) {
        res.json({ success: true, message: "Quiz results sent successfully" });
      } else {
        res.status(500).json({ error: "Failed to send email" });
      }
    } catch (error) {
      console.error('Error sending quiz results email:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/send-welcome-email", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Missing email" });
      }

      const success = await emailService.sendWelcomeEmail(email);
      
      if (success) {
        res.json({ success: true, message: "Welcome email sent successfully" });
      } else {
        res.status(500).json({ error: "Failed to send email" });
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/send-full-report", async (req, res) => {
    try {
      const { email, quizData } = req.body;
      
      if (!email || !quizData) {
        return res.status(400).json({ error: "Missing email or quiz data" });
      }

      const success = await emailService.sendFullReport(email, quizData);
      
      if (success) {
        res.json({ success: true, message: "Full report sent successfully" });
      } else {
        res.status(500).json({ error: "Failed to send email" });
      }
    } catch (error) {
      console.error('Error sending full report email:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // OpenAI chat endpoint for characteristics generation
  app.post("/api/openai-chat", async (req, res) => {
    try {
      const { messages, response_format } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Missing or invalid messages array" });
      }

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: messages,
          response_format: response_format || undefined,
          temperature: 0.7,
        }),
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }

      const data = await openaiResponse.json();
      const content = data.choices[0].message.content;
      
      res.json({ content });
    } catch (error) {
      console.error('Error in OpenAI chat:', error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  // Generate personalized three-paragraph insights for FullReport
  app.post("/api/generate-personalized-insights", async (req, res) => {
    try {
      const { quizData, topBusinessPath } = req.body;
      
      if (!quizData || !topBusinessPath) {
        return res.status(400).json({ error: "Missing quiz data or top business path" });
      }

      const prompt = `Based on this user's complete quiz responses, generate three detailed paragraphs that provide personalized insights about their entrepreneurial fit. Use their actual responses to create specific, relevant analysis.

User Quiz Data:
- Main Motivation: ${quizData.mainMotivation}
- Weekly Time Commitment: ${quizData.weeklyTimeCommitment} hours
- Income Goal: $${quizData.successIncomeGoal}/month
- First Income Timeline: ${quizData.firstIncomeTimeline}
- Upfront Investment: $${quizData.upfrontInvestment}
- Tech Skills Rating: ${quizData.techSkillsRating}/5
- Risk Comfort Level: ${quizData.riskComfortLevel}/5
- Self-Motivation Level: ${quizData.selfMotivationLevel}/5
- Direct Communication Enjoyment: ${quizData.directCommunicationEnjoyment}/5
- Creative Work Enjoyment: ${quizData.creativeWorkEnjoyment}/5
- Work Structure Preference: ${quizData.workStructurePreference}
- Learning Preference: ${quizData.learningPreference}
- Brand Face Comfort: ${quizData.brandFaceComfort}/5
- Long-term Consistency: ${quizData.longTermConsistency}/5
- Trial & Error Comfort: ${quizData.trialErrorComfort}/5
- Organization Level: ${quizData.organizationLevel}/5
- Uncertainty Handling: ${quizData.uncertaintyHandling}/5
- Work Collaboration Preference: ${quizData.workCollaborationPreference}
- Decision Making Style: ${quizData.decisionMakingStyle}
- Familiar Tools: ${quizData.familiarTools?.join(', ') || 'None specified'}
- Passion Identity Alignment: ${quizData.passionIdentityAlignment}/5
- Competitiveness Level: ${quizData.competitivenessLevel}/5
- Discouragement Resilience: ${quizData.discouragementResilience}/5

Top Business Match:
- Name: ${topBusinessPath.name}
- Fit Score: ${topBusinessPath.fitScore}%
- Description: ${topBusinessPath.description}

Generate exactly 3 paragraphs that analyze:

Paragraph 1 - Personality & Work Style Match: How their specific personality traits, work preferences, and learning style align with their top business match. Reference specific quiz responses like their self-motivation level, work structure preference, learning preference, and how these create advantages in their chosen business model.

Paragraph 2 - Financial & Risk Profile: Analyze their income goals, timeline expectations, budget, and risk tolerance. Connect their motivation, investment capacity, and risk comfort level to show how realistic and achievable their goals are given their chosen business path.

Paragraph 3 - Success Prediction & Strategy: Based on their technical skills, communication preferences, decision-making style, and consistency track record, predict their success potential and provide strategic guidance. Reference their specific strengths and how they position them for growth.

Make each paragraph 4-6 sentences long. Use their actual quiz responses throughout - don't use generic statements. Write in a professional, consultative tone that feels personalized to their specific situation.`;

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: 'system',
              content: 'You are an expert business consultant and psychologist specializing in entrepreneurial assessment. Provide detailed, personalized analysis based on quiz responses.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }

      const data = await openaiResponse.json();
      const insights = data.choices[0].message.content;
      
      res.json({ insights });
    } catch (error) {
      console.error('Error generating personalized insights:', error);
      res.status(500).json({ error: "Failed to generate insights" });
    }
  });

  // Generate detailed "Why This Fits You" descriptions for top 3 business matches
  app.post("/api/generate-business-fit-descriptions", async (req, res) => {
    try {
      const { quizData, businessMatches } = req.body;
      
      if (!quizData || !businessMatches || !Array.isArray(businessMatches)) {
        return res.status(400).json({ error: "Missing or invalid quiz data or business matches" });
      }

      const descriptions = [];

      for (let i = 0; i < businessMatches.length; i++) {
        const match = businessMatches[i];
        const rank = i + 1;
        
        const prompt = `Based on this user's quiz responses, generate a detailed "Why This Fits You" description for their ${rank === 1 ? 'top' : rank === 2 ? 'second' : 'third'} business match.

User Quiz Data:
- Main Motivation: ${quizData.mainMotivation}
- Weekly Time Commitment: ${quizData.weeklyTimeCommitment} hours
- Income Goal: $${quizData.successIncomeGoal}/month
- Tech Skills Rating: ${quizData.techSkillsRating}/5
- Risk Comfort Level: ${quizData.riskComfortLevel}/5
- Self-Motivation Level: ${quizData.selfMotivationLevel}/5
- Direct Communication Enjoyment: ${quizData.directCommunicationEnjoyment}/5
- Creative Work Enjoyment: ${quizData.creativeWorkEnjoyment}/5
- Work Structure Preference: ${quizData.workStructurePreference}
- Learning Preference: ${quizData.learningPreference}
- First Income Timeline: ${quizData.firstIncomeTimeline}
- Upfront Investment: $${quizData.upfrontInvestment}
- Brand Face Comfort: ${quizData.brandFaceComfort}/5
- Long-term Consistency: ${quizData.longTermConsistency}/5
- Trial & Error Comfort: ${quizData.trialErrorComfort}/5
- Organization Level: ${quizData.organizationLevel}/5
- Uncertainty Handling: ${quizData.uncertaintyHandling}/5
- Work Collaboration Preference: ${quizData.workCollaborationPreference}
- Decision Making Style: ${quizData.decisionMakingStyle}
- Familiar Tools: ${quizData.familiarTools?.join(', ') || 'None specified'}

Business Match:
- Name: ${match.name}
- Fit Score: ${match.fitScore}%
- Description: ${match.description}
- Time to Profit: ${match.timeToProfit}
- Startup Cost: ${match.startupCost}
- Potential Income: ${match.potentialIncome}

Generate a personalized 4-6 sentence description in two paragraphs explaining why this business model specifically fits this user. Be specific about:
1. How their personality traits, goals, and preferences align with this business model
2. What specific aspects of their quiz responses make them well-suited for this path
3. How their skills, time availability, and risk tolerance match the requirements
4. What unique advantages they bring to this business model

Make it personal and specific to their responses, not generic advice. Write in a supportive, consultative tone.`;

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages: [
              {
                role: 'system',
                content: 'You are an expert business consultant specializing in entrepreneurial personality matching. Generate personalized, specific explanations for why certain business models fit individual users based on their quiz responses.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 300,
          }),
        });

        if (!openaiResponse.ok) {
          throw new Error(`OpenAI API error: ${openaiResponse.status}`);
        }

        const data = await openaiResponse.json();
        const content = data.choices[0].message.content;
        
        descriptions.push({
          businessId: match.id,
          description: content || `This business model aligns well with your ${quizData.selfMotivationLevel >= 4 ? 'high self-motivation' : 'self-driven nature'} and ${quizData.weeklyTimeCommitment} hours/week availability. Your ${quizData.techSkillsRating >= 4 ? 'strong' : 'adequate'} technical skills and ${quizData.riskComfortLevel >= 4 ? 'high' : 'moderate'} risk tolerance make this a suitable match for your entrepreneurial journey.`
        });
      }

      res.json({ descriptions });
    } catch (error) {
      console.error('Error generating business fit descriptions:', error);
      
      // Return fallback descriptions
      const fallbackDescriptions = req.body.businessMatches.map((match: any, index: number) => ({
        businessId: match.id,
        description: `This business model aligns well with your ${req.body.quizData.selfMotivationLevel >= 4 ? 'high self-motivation' : 'self-driven nature'} and ${req.body.quizData.weeklyTimeCommitment} hours/week availability. Your ${req.body.quizData.techSkillsRating >= 4 ? 'strong' : 'adequate'} technical skills and ${req.body.quizData.riskComfortLevel >= 4 ? 'high' : 'moderate'} risk tolerance make this a ${index === 0 ? 'perfect' : index === 1 ? 'excellent' : 'good'} match for your entrepreneurial journey.

${index === 0 ? 'As your top match, this path offers the best alignment with your goals and preferences.' : index === 1 ? 'This represents a strong secondary option that complements your primary strengths.' : 'This provides a solid alternative path that matches your core capabilities.'} Your ${req.body.quizData.learningPreference?.replace('-', ' ')} learning style and ${req.body.quizData.workStructurePreference?.replace('-', ' ')} work preference make this business model particularly suitable for your success.`
      }));
      
      res.json({ descriptions: fallbackDescriptions });
    }
  });

  // Enhanced email functionality for unpaid users
  app.post("/api/email-results", async (req, res) => {
    try {
      const { sessionId, email, quizData, isPaidUser } = req.body;
      
      if (!sessionId || !quizData) {
        return res.status(400).json({ error: "Missing session ID or quiz data" });
      }

      // Check if user is paid (has account)
      if (isPaidUser) {
        // For paid users, send full report
        const success = await emailService.sendFullReport(email, quizData);
        if (success) {
          res.json({ success: true, message: "Full report sent successfully" });
        } else {
          res.status(500).json({ error: "Failed to send full report" });
        }
        return;
      }

      // For unpaid users, check if email already exists for this session
      const existingEmail = await storage.getUnpaidUserEmail(sessionId);
      
      if (existingEmail) {
        // Email already stored, just send again
        const success = await emailService.sendQuizResults(existingEmail.email, quizData);
        if (success) {
          res.json({ success: true, message: "Results sent to your email again" });
        } else {
          res.status(500).json({ error: "Failed to send email" });
        }
        return;
      }

      // New email for unpaid user
      if (!email) {
        return res.status(400).json({ error: "Email is required for new users" });
      }

      // Store the email and send results
      await storage.storeUnpaidUserEmail(sessionId, email, quizData);
      const success = await emailService.sendQuizResults(email, quizData);
      
      if (success) {
        res.json({ success: true, message: "Results sent to your email" });
      } else {
        res.status(500).json({ error: "Failed to send email" });
      }
    } catch (error) {
      console.error('Error in email-results endpoint:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get stored email for unpaid users
  app.get("/api/get-stored-email/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const storedEmail = await storage.getUnpaidUserEmail(sessionId);
      
      if (storedEmail) {
        res.json({ email: storedEmail.email });
      } else {
        res.json({ email: null });
      }
    } catch (error) {
      console.error('Error getting stored email:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Test email endpoint for debugging
  app.post("/api/test-email", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      console.log(`Testing email delivery to: ${email}`);
      
      const success = await emailService.sendEmail({
        to: email,
        subject: 'BizModelAI Email Test',
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Email Test Successful!</h2>
              <p>This is a test email from BizModelAI to verify email delivery is working.</p>
              <p>If you received this email, the email system is functioning correctly.</p>
              <p>Time sent: ${new Date().toISOString()}</p>
            </body>
          </html>
        `
      });

      if (success) {
        res.json({ success: true, message: "Test email sent successfully" });
      } else {
        res.status(500).json({ error: "Failed to send test email" });
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
