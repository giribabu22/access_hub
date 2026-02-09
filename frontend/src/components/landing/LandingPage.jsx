import React, { useState, useEffect } from 'react';

import { ArrowRight, Check } from '../icons/Icons';
import SubscriptionModal from '../subscription/SubscriptionModal';
import DemoSection from './DemoSection';
import { statsAPI } from '../../services/api';

const LandingPage = () => {

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const [systemStats, setSystemStats] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Fetch real system stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsAPI.overview();
        setSystemStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Use fallback data if API fails
        setSystemStats({
          organizations: { total: 0, active: 0 },
          employees: { total: 0, active: 0 },
          visitors: { total: 0 }
        });
      }
    };
    fetchStats();
  }, []);

  // Dynamic stats based on real data
  const stats = [
    { value: systemStats ? `${systemStats.employees?.total || 0}+` : '0+', label: 'Active Users' },
    { value: systemStats ? `${systemStats.organizations?.total || 0}+` : '0+', label: 'Organizations' },
    { value: systemStats ? `${systemStats.visitors?.total || 0}+` : '0+', label: 'Visitors Tracked' },
    { value: '24/7', label: 'Support' }
  ];

  const features = [
    {
      icon: '👥',
      title: 'Employee Management',
      description: 'Comprehensive employee tracking, attendance monitoring, and role-based access control.',
      color: 'from-blue-500 to-cyan-500',
      details: ['Digital ID cards', 'Biometric authentication', 'Shift management', 'Department organization']
    },
    {
      icon: '📹',
      title: 'Camera Integration',
      description: 'Real-time video monitoring, facial recognition, and automated security alerts.',
      color: 'from-cyan-500 to-pink-500',
      details: ['AI-powered facial recognition', 'Motion detection', 'Live streaming', '24/7 recording']
    },
    {
      icon: '👤',
      title: 'Visitor Tracking',
      description: 'Streamlined visitor registration, badge printing, and entry/exit monitoring.',
      color: 'from-green-500 to-teal-500',
      details: ['QR code check-in', 'Host notifications', 'Badge printing', 'Pre-registration']
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Detailed reports, usage statistics, and predictive insights for better decision making.',
      color: 'from-orange-500 to-red-500',
      details: ['Real-time dashboards', 'Custom reports', 'Traffic patterns', 'Security insights']
    },
    {
      icon: '🏢',
      title: 'Multi-Location Support',
      description: 'Manage multiple offices, floors, and departments from a single dashboard.',
      color: 'from-teal-500 to-teal-600',
      details: ['Centralized management', 'Location-specific rules', 'Cross-site reporting', 'Unified dashboard']
    },
    {
      icon: '🔒',
      title: 'Enterprise Security',
      description: 'Military-grade encryption, compliance reporting, and audit trails.',
      color: 'from-gray-700 to-gray-900',
      details: ['End-to-end encryption', 'Compliance reports', 'Audit logs', 'Data privacy']
    },
    {
      icon: '📱',
      title: 'Mobile Applications',
      description: 'iOS and Android apps for on-the-go management and visitor self-service.',
      color: 'from-pink-500 to-rose-500',
      details: ['Native mobile apps', 'Offline capabilities', 'Push notifications', 'Self-service kiosks']
    },
    {
      icon: '🔗',
      title: 'API Integrations',
      description: 'Connect with existing systems through our comprehensive REST API.',
      color: 'from-teal-500 to-green-500',
      details: ['RESTful API', 'Webhooks', 'SSO integration', 'Custom connectors']
    },
    {
      icon: '⚡',
      title: 'Real-time Alerts',
      description: 'Instant notifications for security events, visitor arrivals, and system status.',
      color: 'from-yellow-500 to-orange-500',
      details: ['Email notifications', 'SMS alerts', 'Slack integration', 'Custom triggers']
    }
  ];

  const integrations = [
    {
      category: 'Security Systems',
      items: [
        { name: 'HIKVISION', logo: '🔐', description: 'Camera systems integration' },
        { name: 'Axis Communications', logo: '📹', description: 'Video surveillance' },
        { name: 'Bosch Security', logo: '🛡️', description: 'Access control systems' },
        { name: 'Honeywell', logo: '🏠', description: 'Building automation' }
      ]
    },
    {
      category: 'Identity & Access',
      items: [
        { name: 'Active Directory', logo: '🏢', description: 'Employee directory sync' },
        { name: 'LDAP', logo: '🔑', description: 'Authentication protocol' },
        { name: 'SAML SSO', logo: '🎫', description: 'Single sign-on' },
        { name: 'OAuth 2.0', logo: '🔐', description: 'Secure authorization' }
      ]
    },
    {
      category: 'Communication',
      items: [
        { name: 'Slack', logo: '💬', description: 'Team notifications' },
        { name: 'Microsoft Teams', logo: '👥', description: 'Collaboration platform' },
        { name: 'Twilio', logo: '📱', description: 'SMS notifications' },
        { name: 'SendGrid', logo: '📧', description: 'Email delivery' }
      ]
    },
    {
      category: 'Cloud Platforms',
      items: [
        { name: 'AWS', logo: '☁️', description: 'Cloud infrastructure' },
        { name: 'Microsoft Azure', logo: '🌐', description: 'Enterprise cloud' },
        { name: 'Google Cloud', logo: '🚀', description: 'AI and ML services' },
        { name: 'Docker', logo: '🐳', description: 'Containerization' }
      ]
    }
  ];

  const useCases = [
    {
      industry: 'Corporate Offices',
      icon: '🏢',
      description: 'Manage employee access and visitor registration for office buildings.',
      features: ['Digital visitor badges', 'Host notifications', 'Meeting room access', 'Contractor tracking'],
      stats: { users: '2,500+', locations: '45' }
    },
    {
      industry: 'Healthcare Facilities',
      icon: '🏥',
      description: 'HIPAA-compliant visitor management for medical facilities.',
      features: ['Patient privacy protection', 'Staff credential verification', 'Emergency protocols', 'Audit trails'],
      stats: { users: '1,200+', locations: '18' }
    },
    {
      industry: 'Educational Institutions',
      icon: '🎓',
      description: 'Campus security and visitor control for schools and universities.',
      features: ['Parent check-in', 'Campus events management', 'Student safety', 'Visitor screening'],
      stats: { users: '3,100+', locations: '32' }
    },
    {
      industry: 'Manufacturing',
      icon: '🏭',
      description: 'Industrial site access control with safety compliance.',
      features: ['Safety certification checks', 'Contractor management', 'Restricted area access', 'Compliance reporting'],
      stats: { users: '800+', locations: '12' }
    }
  ];

  const faqItems = [
    {
      question: 'How long does setup typically take?',
      answer: 'Most organizations complete setup within 1-2 weeks, including staff training and system configuration. We provide setup assistance and documentation.'
    },
    {
      question: 'What data privacy standards do you follow?',
      answer: 'We follow industry-standard security practices including data encryption and comply with GDPR and HIPAA requirements where applicable.'
    },
    {
      question: 'Can AccessHub integrate with existing systems?',
      answer: 'Yes, we offer integration with common security systems and identity providers through our API. Integration complexity varies by system.'
    },
    {
      question: 'What support options are available?',
      answer: 'We provide email support during business hours, comprehensive documentation, and video tutorials. Phone support is available for Enterprise plans.'
    },
    {
      question: 'How does pricing work for multiple locations?',
      answer: 'Pricing is per location with volume discounts starting at 5+ locations. Contact us for custom pricing on larger deployments.'
    }
  ];

  const testimonials = [
    {
      quote: "AccessHub simplified our visitor check-in process. The interface is intuitive and our reception staff picked it up quickly.",
      author: "Sarah Johnson",
      role: "Facilities Manager",
      company: "Riverside Office Park",
      avatar: "👩‍💼"
    },
    {
      quote: "The reporting features help us track visitor patterns and improve our security protocols. Good value for the price.",
      author: "Michael Chen",
      role: "Security Coordinator",
      company: "Metro Manufacturing",
      avatar: "👨‍💼"
    },
    {
      quote: "We needed a HIPAA-compliant solution for our medical center. AccessHub met our requirements and was easy to implement.",
      author: "Dr. Emily Rodriguez",
      role: "Administrator",
      company: "Westside Medical Center",
      avatar: "👩‍⚕️"
    }
  ];

  const subscriptionPlans = [
    // {
    //   id: 'free',
    //   name: 'Free',
    //   price: '$0',
    //   period: '/month',
    //   description: 'Perfect for small teams getting started',
    //   icon: '📦',
    //   color: 'border-gray-200 bg-white',
    //   buttonStyle: 'bg-teal-100 text-gray-800 hover:bg-gray-200',
    //   popular: false,
    //   features: [
    //     '5 employees',
    //     '2 cameras',
    //     '1 location',
    //     'Basic reporting',
    //     'Email support'
    //   ],
    //   limits: {
    //     employees: 5,
    //     cameras: 2,
    //     locations: 1
    //   }
    // },
    // {
    //   id: 'starter',
    //   name: 'Starter',
    //   price: '$29',
    //   period: '/month',
    //   description: 'Great for growing businesses',
    //   icon: '🚀',
    //   color: 'border-blue-200 bg-blue-50',
    //   buttonStyle: 'bg-blue-600 text-white hover:bg-blue-700',
    //   popular: true,
    //   features: [
    //     '50 employees',
    //     '10 cameras',
    //     '3 locations',
    //     'Advanced analytics',
    //     'Visitor management',
    //     'Priority support',
    //     'Mobile app access'
    //   ],
    //   limits: {
    //     employees: 50,
    //     cameras: 10,
    //     locations: 3
    //   }
    // },
    // {
    //   id: 'professional',
    //   name: 'Professional',
    //   price: '$99',
    //   period: '/month',
    //   description: 'For established organizations',
    //   icon: '👑',
    //   color: 'border-green-200 bg-green-50',
    //   buttonStyle: 'bg-green-600 text-white hover:bg-green-700',
    //   popular: false,
    //   features: [
    //     '200 employees',
    //     '50 cameras',
    //     '10 locations',
    //     'Custom integrations',
    //     'API access',
    //     'Advanced security',
    //     '24/7 phone support',
    //     'Custom branding'
    //   ],
    //   limits: {
    //     employees: 200,
    //     cameras: 50,
    //     locations: 10
    //   }
    // },
    // {
    //   id: 'enterprise',
    //   name: 'Enterprise',
    //   price: 'Custom',
    //   period: '',
    //   description: 'Unlimited scale for large enterprises',
    //   icon: '🏢',
    //   color: 'border-purple-200 bg-teal-50',
    //   buttonStyle: 'bg-teal-600 text-white hover:bg-teal-700',
    //   popular: false,
    //   features: [
    //     'Unlimited employees',
    //     'Unlimited cameras',
    //     'Unlimited locations',
    //     'Dedicated support',
    //     'Custom development',
    //     'On-premise deployment',
    //     'SLA guarantee',
    //     'Training included'
    //   ],
    //   limits: {
    //     employees: -1,
    //     cameras: -1,
    //     locations: -1
    //   }
    // }
  ];

  const handleGetStarted = () => {
    setShowSubscriptionModal(true);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    // Here you would typically send the contact form to your backend
    console.log('Contact form submitted:', contactForm);
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setContactForm({ name: '', email: '', company: '', message: '' });
    }, 3000);
  };

  const updateContactForm = (field, value) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-white pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-20 pb-16 text-center lg:pt-32">
            <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-6xl">
              Workplace{' '}
              <span className="relative whitespace-nowrap text-blue-600">
                <span className="relative">Access Control</span>
              </span>{' '}
              Made Simple
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700">
              A professional visitor management solution that helps organizations manage employee access,
              track visitors, and maintain security compliance.
            </p>
            <div className="mt-10 flex justify-center gap-x-6">
              <button
                onClick={() => handleGetStarted()}
                className="group inline-flex items-center justify-center rounded-full py-3 px-6 text-sm font-semibold focus:outline-none bg-slate-900 text-white hover:bg-slate-700 transition-colors"
              >
                Get started
              </button>
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="group inline-flex ring-1 items-center justify-center rounded-full py-3 px-6 text-sm focus:outline-none ring-slate-200 text-slate-700 hover:text-slate-900 hover:ring-slate-300 transition-colors"
              >
                View pricing
              </button>
            </div>

            {/* Simple Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-semibold text-slate-900">{stat.value}</div>
                  <div className="text-sm text-slate-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Core Features
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Essential tools for managing workplace access and security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-teal-50/95 rounded-lg p-6 border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{feature.description}</p>
                {feature.details && (
                  <ul className="text-xs text-slate-500 space-y-1">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center">
                        <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <DemoSection />

      {/* Integrations Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Seamless Integrations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect AccessHub VMS with your existing systems and tools. Over 100+ integrations available.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {integrations.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-teal-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.category}</h3>
                <div className="space-y-3">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center space-x-3 p-3 bg-teal-50/95 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="text-2xl">{item.logo}</div>
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what industry leaders say about AccessHub VMS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-teal-50 to-white rounded-2xl p-8 border border-teal-100">
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <blockquote className="text-gray-700 mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-teal-600 font-medium">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-teal-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Got questions? We have answers. Can't find what you're looking for? Contact our support team.
            </p>
          </div>

          <div className="space-y-6">
            {faqItems.map((faq, index) => (
              <div key={index} className="bg-teal-50/95 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Seamless Integrations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect AccessHub VMS with your existing systems and tools. Over 100+ integrations available.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {integrations.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-teal-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.category}</h3>
                <div className="space-y-3">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center space-x-3 p-3 bg-teal-50/95 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="text-2xl">{item.logo}</div>
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted Across Industries
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From corporate offices to healthcare facilities, AccessHub VMS adapts to your industry's unique needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-teal-50/95 rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="text-4xl mr-4">{useCase.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{useCase.industry}</h3>
                    <div className="flex space-x-4 text-sm text-gray-600 mt-1">
                      <span>{useCase.stats.users} users</span>
                      <span>•</span>
                      <span>{useCase.stats.locations} locations</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">{useCase.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  {useCase.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what industry leaders say about AccessHub VMS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-teal-50 to-white rounded-2xl p-8 border border-teal-100">
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <blockquote className="text-gray-700 mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-teal-600 font-medium">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-teal-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Got questions? We have answers. Can't find what you're looking for? Contact our support team.
            </p>
          </div>

          <div className="space-y-6">
            {faqItems.map((faq, index) => (
              <div key={index} className="bg-teal-50/95 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {subscriptionPlans.map((plan) => (
              <div key={plan.id} className={`relative rounded-2xl p-8 ${plan.color} border-2 transition-all duration-300 hover:shadow-xl hover:scale-105`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">{plan.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${plan.buttonStyle}`}
                  onClick={() => handleGetStarted(plan.id)}
                >
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Workplace?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Join thousands of organizations already using AccessHub VMS to secure and streamline their operations.
          </p>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ready to transform your visitor management? Contact us today for a personalized demo and consultation.
            </p>
          </div>

          <div className="bg-teal-50/95 rounded-2xl shadow-xl p-8">
            {formSubmitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-600">We've received your message and will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={contactForm.name}
                      onChange={(e) => updateContactForm('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => updateContactForm('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="your@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={contactForm.company}
                    onChange={(e) => updateContactForm('company', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    required
                    value={contactForm.message}
                    onChange={(e) => updateContactForm('message', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Tell us about your requirements and how we can help..."
                  />
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
                  >
                    Send Message
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">support@accesshub.com</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🕒</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Response Time</h3>
              <p className="text-gray-600">Within 24 hours</p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        initialTab="plans"
      />
    </div>
  );
};

export default LandingPage;
