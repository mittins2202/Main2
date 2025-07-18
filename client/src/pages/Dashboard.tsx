import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  BookOpen, 
  Target, 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Star,
  CheckCircle,
  Award,
  Users,
  Calendar,
  Edit,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { businessPaths } from '../data/businessPaths';
import { QuizRetakeDashboard } from '../components/QuizRetakeDashboard';
import { QuizAttemptHistory } from '../components/QuizAttemptHistory';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedBusinessModel, setSelectedBusinessModel] = useState<any>(null);
  const [showBusinessSelection, setShowBusinessSelection] = useState(false);
  const [hasEverSelectedModel, setHasEverSelectedModel] = useState(false);

  // Check if user has ever selected a business model on component mount
  React.useEffect(() => {
    const savedModel = localStorage.getItem('selectedBusinessModel');
    const hasSelected = localStorage.getItem('hasEverSelectedModel');
    
    if (savedModel) {
      setSelectedBusinessModel(JSON.parse(savedModel));
    }
    
    if (hasSelected === 'true') {
      setHasEverSelectedModel(true);
    } else {
      // Show business selection if user has never selected a model
      setShowBusinessSelection(true);
    }
  }, []);

  // Get fit category based on score
  const getFitCategory = (score: number) => {
    if (score >= 70) return { label: "Best Fit", color: "bg-green-500", textColor: "text-green-700" };
    if (score >= 50) return { label: "Strong Fit", color: "bg-blue-500", textColor: "text-blue-700" };
    if (score >= 30) return { label: "Possible Fit", color: "bg-yellow-500", textColor: "text-yellow-700" };
    return { label: "Poor Fit", color: "bg-red-500", textColor: "text-red-700" };
  };

  // Top 9 business models - in real app this would come from quiz results
  const topBusinessModels = [
    {
      id: "content-creation-ugc",
      name: "Content Creation & UGC",
      description: "Create engaging content and user-generated content for brands",
      fitScore: 92,
      timeToProfit: "2-4 weeks",
      potentialIncome: "$2K-15K/month",
      difficulty: "Beginner",
      icon: "📱"
    },
    {
      id: "affiliate-marketing",
      name: "Affiliate Marketing",
      description: "Promote other people's products and earn commission on sales",
      fitScore: 88,
      timeToProfit: "3-6 months",
      potentialIncome: "$100-10K+/month",
      difficulty: "Easy",
      icon: "🔗"
    },
    {
      id: "freelancing",
      name: "Freelancing",
      description: "Offer your skills and services to clients on a project basis",
      fitScore: 85,
      timeToProfit: "1-2 weeks",
      potentialIncome: "$500-8K/month",
      difficulty: "Easy",
      icon: "💼"
    },
    {
      id: "e-commerce-dropshipping",
      name: "E-commerce / Dropshipping",
      description: "Sell products online without holding inventory",
      fitScore: 78,
      timeToProfit: "2-6 months",
      potentialIncome: "$1K-50K/month",
      difficulty: "Medium",
      icon: "🛒"
    },
    {
      id: "virtual-assistant",
      name: "Virtual Assistant",
      description: "Provide administrative support to businesses remotely",
      fitScore: 76,
      timeToProfit: "1-3 weeks",
      potentialIncome: "$300-5K/month",
      difficulty: "Easy",
      icon: "💻"
    },
    {
      id: "online-coaching-consulting",
      name: "Online Coaching & Consulting",
      description: "Share your expertise through 1-on-1 coaching or consulting",
      fitScore: 74,
      timeToProfit: "4-8 weeks",
      potentialIncome: "$1K-20K/month",
      difficulty: "Medium",
      icon: "🎯"
    },
    {
      id: "print-on-demand",
      name: "Print on Demand",
      description: "Design and sell custom products without inventory",
      fitScore: 70,
      timeToProfit: "6-12 weeks",
      potentialIncome: "$200-8K/month",
      difficulty: "Easy",
      icon: "🎨"
    },
    {
      id: "youtube-automation",
      name: "YouTube Automation",
      description: "Create and monetize YouTube channels with outsourced content",
      fitScore: 68,
      timeToProfit: "3-9 months",
      potentialIncome: "$500-15K/month",
      difficulty: "Medium",
      icon: "📹"
    },
    {
      id: "local-service-arbitrage",
      name: "Local Service Arbitrage",
      description: "Connect local customers with service providers",
      fitScore: 65,
      timeToProfit: "2-8 weeks",
      potentialIncome: "$1K-12K/month",
      difficulty: "Medium",
      icon: "🏠"
    }
  ];

  const handleBusinessModelSelect = (businessModel: any) => {
    setSelectedBusinessModel(businessModel);
    setShowBusinessSelection(false);
    setHasEverSelectedModel(true);
    
    // Save to localStorage
    localStorage.setItem('selectedBusinessModel', JSON.stringify(businessModel));
    localStorage.setItem('hasEverSelectedModel', 'true');
  };

  const handleChangeBusinessModel = () => {
    setShowBusinessSelection(true);
  };

  const handleStartCompleteGuide = () => {
    if (selectedBusinessModel) {
      navigate(`/guide/${selectedBusinessModel.id}`);
      // Scroll to top after navigation
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 0);
    }
  };

  const handleNavigateWithScrollToTop = (path: string) => {
    navigate(path);
    // Scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 0);
  };

  const quickActions = [
    {
      title: 'Retake Quiz',
      description: 'Update your preferences and get new recommendations',
      href: '/quiz',
      icon: BookOpen,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      useLink: true
    },
    {
      title: 'View Full Results',
      description: 'See your complete personalized business analysis',
      href: '/results',
      icon: Target,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      useLink: false
    },
    {
      title: 'Explore All Models',
      description: 'Browse our complete business model database',
      href: '/explore',
      icon: BarChart3,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      useLink: false
    }
  ];

  const recentActivity = [
    {
      action: 'Completed Business Path Quiz',
      time: '2 hours ago',
      icon: BookOpen,
      color: 'blue'
    },
    {
      action: 'Viewed Content Creation results',
      time: '2 hours ago',
      icon: Target,
      color: 'green'
    },
    {
      action: 'Joined Business Path community',
      time: '1 day ago',
      icon: Users,
      color: 'purple'
    }
  ];

  const learningModules = [
    {
      title: "Getting Started Fundamentals",
      description: "Essential foundations for your business journey",
      progress: 0,
      duration: "45 min",
      lessons: 8
    },
    {
      title: "Content Strategy Mastery",
      description: "Create content that converts and builds audience",
      progress: 0,
      duration: "2.5 hours",
      lessons: 12
    },
    {
      title: "Monetization Strategies",
      description: "Turn your content into consistent income streams",
      progress: 0,
      duration: "1.8 hours",
      lessons: 10
    }
  ];

  // Business Model Selection Screen
  const BusinessModelSelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Business Model</h1>
            <p className="text-xl text-gray-600">Select the business model you'd like to get a complete guide for</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-8">
            {topBusinessModels.map((model, index) => {
              const fitCategory = getFitCategory(model.fitScore);
              return (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative bg-white rounded-3xl p-6 shadow-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 border-gray-200 hover:border-gray-300 w-full aspect-[4/3]"
                  onClick={() => handleBusinessModelSelect(model)}
                >
                  <div className="absolute -top-3 left-6">
                    <div className={`${fitCategory.color} text-white px-4 py-1 rounded-full text-sm font-semibold`}>
                      {fitCategory.label} • {model.fitScore}%
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-3">
                    <div className="text-3xl mr-3">{model.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{model.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 leading-tight">{model.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Time to Profit</div>
                      <div className="font-semibold text-gray-900 text-sm">{model.timeToProfit}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Income</div>
                      <div className="font-semibold text-gray-900 text-sm">{model.potentialIncome}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Difficulty</div>
                      <div className="font-semibold text-gray-900 text-sm">{model.difficulty}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className={`text-sm font-medium ${fitCategory.textColor}`}>
                        {fitCategory.label}
                      </span>
                    </div>
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all text-sm">
                      Select This Model
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickActions.map((action, index) => {
                  if (action.useLink) {
                    return (
                      <Link
                        key={index}
                        to={action.href}
                        className="group flex flex-col items-center p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300 border border-gray-100 hover:border-gray-200 text-center"
                      >
                        <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center mb-4`}>
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                          {action.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{action.description}</p>
                      </Link>
                    );
                  } else {
                    return (
                      <button
                        key={index}
                        onClick={() => handleNavigateWithScrollToTop(action.href)}
                        className="group flex flex-col items-center p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300 border border-gray-100 hover:border-gray-200 text-center w-full"
                      >
                        <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center mb-4`}>
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                          {action.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{action.description}</p>
                      </button>
                    );
                  }
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );

  // Show business model selection if user wants to see it or has never selected a model
  if (showBusinessSelection) {
    return <BusinessModelSelection />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-xl text-gray-600">
                Ready to take the next step in your entrepreneurial journey?
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Star className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Start Your Journey - Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          {selectedBusinessModel ? (
            <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 md:p-12 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-4">
                    <span className="text-3xl">{selectedBusinessModel.icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold mr-3">
                        {selectedBusinessModel.fitScore}% MATCH
                      </span>
                      <span className="text-blue-100 text-sm font-medium">AI Recommended</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                      Start Your Journey
                    </h2>
                    <p className="text-blue-100 text-lg">
                      Complete Guide for {selectedBusinessModel.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleChangeBusinessModel}
                  className="flex items-center text-blue-100 hover:text-white transition-colors text-sm font-medium"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Change Model
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-blue-200 mr-2" />
                    <span className="text-blue-100 text-sm font-medium">Time to Profit</span>
                  </div>
                  <div className="text-white font-bold text-lg">{selectedBusinessModel.timeToProfit}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-green-300 mr-2" />
                    <span className="text-blue-100 text-sm font-medium">Income Potential</span>
                  </div>
                  <div className="text-white font-bold text-lg">{selectedBusinessModel.potentialIncome}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <Award className="h-5 w-5 text-yellow-300 mr-2" />
                    <span className="text-blue-100 text-sm font-medium">Difficulty</span>
                  </div>
                  <div className="text-white font-bold text-lg">{selectedBusinessModel.difficulty}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleStartCompleteGuide}
                  className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
                >
                  View Complete Guide
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <Link
                  to="/results"
                  className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
                >
                  View Full Analysis
                </Link>
              </div>
            </div>
          </div>
          ) : (
            <div className="relative bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 rounded-3xl p-8 md:p-12 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-gray-200 text-lg mb-8">
                  Choose a business model to begin your entrepreneurial journey
                </p>
                <button
                  onClick={handleChangeBusinessModel}
                  className="bg-white text-gray-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center mx-auto"
                >
                  Choose Business Model
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-8"
          >
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  if (action.useLink) {
                    return (
                      <Link
                        key={index}
                        to={action.href}
                        className="group flex items-center p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-gray-100 hover:border-gray-200"
                      >
                        <div className={`w-10 h-10 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mr-4`}>
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-gray-600 text-sm">{action.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </Link>
                    );
                  } else {
                    return (
                      <button
                        key={index}
                        onClick={() => handleNavigateWithScrollToTop(action.href)}
                        className="group flex items-center p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-gray-100 hover:border-gray-200 w-full text-left"
                      >
                        <div className={`w-10 h-10 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mr-4`}>
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-gray-600 text-sm">{action.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </button>
                    );
                  }
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 bg-${activity.color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <activity.icon className={`h-4 w-4 text-${activity.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>


          </motion.div>
        </div>

        {/* Quiz Status and History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuizRetakeDashboard 
              userId={1} 
              onRetakeQuiz={() => handleNavigateWithScrollToTop('/quiz')}
            />
            <QuizAttemptHistory userId={1} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;