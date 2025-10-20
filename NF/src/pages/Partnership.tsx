// src/pages/Partnership.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Handshake, 
  Building, 
  Briefcase, 
  Heart, 
  Users, 
  Award, 
  Globe, 
  Check, 
  Mail, 
  Phone,
  ArrowRight,
  Star,
  Shield,
  Target
} from 'lucide-react';

const Partnership: React.FC = () => {
  const [activeTab, setActiveTab] = useState('corporate');

  const partnershipTypes = [
    {
      id: 'corporate',
      name: 'Corporate Partnerships',
      icon: Building,
      description: 'Align your CSR goals with meaningful community impact',
      color: 'red',
      benefits: [
        'Employee volunteer programs in Ganze',
        'Brand association with trusted community work',
        'Customized impact reports and transparency',
        'Team-building through hands-on projects',
        'Media and recognition opportunities'
      ],
      examples: [
        'Project-specific sponsorship',
        'Employee matching gifts',
        'In-kind donations and services',
        'Cause-related marketing campaigns'
      ]
    },
    {
      id: 'ngo',
      name: 'NGO & Foundation Partners',
      icon: Briefcase,
      description: 'Collaborate to amplify our collective impact',
      color: 'blue',
      benefits: [
        'Joint program implementation',
        'Shared resources and expertise',
        'Cross-learning and capacity building',
        'Expanded reach in Kilifi County',
        'Grant-making and funding opportunities'
      ],
      examples: [
        'Program co-design and delivery',
        'Technical assistance and training',
        'Research and evaluation partnerships',
        'Advocacy and awareness campaigns'
      ]
    },
    {
      id: 'church',
      name: 'Church & Faith Groups',
      icon: Heart,
      description: 'Join hands in Christ-centered service',
      color: 'purple',
      benefits: [
        'Mission trip opportunities',
        'Congregational sponsorship programs',
        'Prayer partnerships and spiritual support',
        'Community outreach collaborations',
        'Discipleship and mentorship programs'
      ],
      examples: [
        'Church planting support',
        'Pastoral training programs',
        'Community evangelism events',
        'Children and youth ministries'
      ]
    },
    {
      id: 'individual',
      name: 'Individual Partners',
      icon: Users,
      description: 'Make a personal impact in Ganze community',
      color: 'green',
      benefits: [
        'Child sponsorship programs',
        'Monthly giving opportunities',
        'Legacy and planned giving',
        'Skills-based volunteering',
        'Personal connection with beneficiaries'
      ],
      examples: [
        'Ahoho Mission child sponsorship',
        'Widows empowerment support',
        'Educational scholarship funding',
        'Medical mission participation'
      ]
    }
  ];

  const currentPartners = [
    {
      name: 'Dzarino CBO',
      type: 'Community Partner',
      logo: 'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760969357/Dzarnio-logo_y9trca.png',
      impact: 'Health initiative collaboration'
    },
    {
      name: 'KickStart International',
      type: 'Agriculture Partner',
      logo: 'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760969470/KickStart-Logo_Color_RGB_sg1t6p.svg',
      impact: 'Water pumps and farming training'
    },
    {
      name: 'ICC Mombasa',
      type: 'Feeding Program Partner',
      logo: 'ICC',
      impact: 'Daily porridge program support'
    },
    {
      name: 'CITAM Mombasa',
      type: 'Faith Partner',
      logo: 'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760969566/citam-logo-1_lg4qqi.png',
      impact: 'Spiritual and outreach support'
    }
  ];

  const partnershipBenefits = [
    {
      icon: Target,
      title: 'Measurable Impact',
      description: 'See tangible results with detailed impact reports and community feedback'
    },
    {
      icon: Shield,
      title: 'Full Transparency',
      description: 'Complete financial and program transparency with regular updates'
    },
    {
      icon: Users,
      title: 'Community Integration',
      description: 'Work directly with local community leaders and beneficiaries'
    },
    {
      icon: Award,
      title: 'Recognition',
      description: 'Get acknowledged across our platforms and community events'
    }
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    partnershipType: 'corporate',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Partnership form submitted:', formData);
    alert('Thank you for your interest in partnership! We will contact you soon.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const activePartnership = partnershipTypes.find(p => p.id === activeTab);

  return (
    <div className="min-h-screen flex flex-col pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-red-800 to-red-600 text-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/20"
            >
              <Handshake className="h-5 w-5" />
              <span className="font-semibold">Transform Lives Together</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Partner With <span className="text-yellow-300">Neema Foundation</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join our mission to create sustainable change in Ganze. Together, we can feed children, empower widows, and build a brighter future for generations.
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('partnership-options')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-red-800 hover:bg-gray-100 transition-colors rounded-2xl px-8 py-4 font-semibold text-lg flex items-center gap-3"
              >
                <Handshake className="h-5 w-5" />
                Explore Partnership Options
                <ArrowRight className="h-5 w-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-white text-white hover:bg-white hover:text-red-800 transition-colors rounded-2xl px-8 py-4 font-semibold text-lg"
              >
                Start Conversation
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Current Partners Showcase */}
      <section className="py-16 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Trusted by Impact-Driven Organizations
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're proud to collaborate with organizations that share our commitment to transforming Ganze community.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {currentPartners.map((partner, index) => (
              <motion.div
                key={partner.name}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 h-full flex flex-col items-center justify-center">
                  {partner.logo.startsWith('http') ? (
                    <img 
                      src={partner.logo} 
                      alt={`${partner.name} logo`}
                      className="h-12 w-auto mb-4 object-contain"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-4">
                      {partner.name.split(' ').map(word => word[0]).join('')}
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900 mb-2">{partner.name}</h3>
                  <div className="text-red-800 text-xs font-semibold bg-red-50 px-2 py-1 rounded-full mb-2">
                    {partner.type}
                  </div>
                  <p className="text-gray-600 text-sm">{partner.impact}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Options */}
      <section id="partnership-options" className="py-20 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Choose Your Partnership Path
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Whether you're a corporation, NGO, church, or individual, there's a meaningful way to join our mission.
            </p>
          </motion.div>

          {/* Partnership Tabs */}
          <div className="max-w-6xl mx-auto">
            {/* Tab Headers */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {partnershipTypes.map((type) => (
                <motion.button
                  key={type.id}
                  onClick={() => setActiveTab(type.id)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                    activeTab === type.id
                      ? 'bg-red-800 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <type.icon className="h-5 w-5" />
                  {type.name}
                </motion.button>
              ))}
            </div>

            {/* Active Tab Content */}
            {activePartnership && (
              <motion.div
                key={activePartnership.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Left Content */}
                  <div className="p-8 lg:p-12">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 bg-${activePartnership.color}-100 rounded-xl flex items-center justify-center`}>
                        <activePartnership.icon className={`h-6 w-6 text-${activePartnership.color}-800`} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{activePartnership.name}</h3>
                        <p className="text-gray-600">{activePartnership.description}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Partnership Benefits</h4>
                        <ul className="space-y-3">
                          {activePartnership.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Partnership Examples</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activePartnership.examples.map((example, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg px-3 py-2">
                              <span className="text-sm text-gray-700">{example}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Content - CTA */}
                  <div className="bg-gradient-to-br from-red-800 to-red-600 p-8 lg:p-12 text-white flex flex-col justify-center">
                    <h4 className="text-2xl font-bold mb-4">Ready to Make an Impact?</h4>
                    <p className="text-white/90 mb-6">
                      Let's discuss how we can create meaningful change together in Ganze community.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                      className="bg-white text-red-800 hover:bg-gray-100 transition-colors rounded-xl px-6 py-3 font-semibold w-full"
                    >
                      Start Partnership Conversation
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Why Partner With Neema Foundation?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {partnershipBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-red-50 rounded-2xl p-8 border border-red-200 h-full">
                  <benefit.icon className="h-12 w-12 text-red-800 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 text-lg mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-20 bg-gray-50">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Start Your Partnership Journey</h2>
              <p className="text-gray-600">
                Fill out the form below and our partnership team will contact you within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-800 focus:border-transparent transition-colors"
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
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-800 focus:border-transparent transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                    Organization
                  </label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-800 focus:border-transparent transition-colors"
                    placeholder="Your organization name"
                  />
                </div>

                <div>
                  <label htmlFor="partnershipType" className="block text-sm font-medium text-gray-700 mb-2">
                    Partnership Interest *
                  </label>
                  <select
                    id="partnershipType"
                    name="partnershipType"
                    required
                    value={formData.partnershipType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-800 focus:border-transparent transition-colors"
                  >
                    <option value="corporate">Corporate Partnership</option>
                    <option value="ngo">NGO/Foundation Partnership</option>
                    <option value="church">Church/Faith Group</option>
                    <option value="individual">Individual Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us about your partnership interests *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-800 focus:border-transparent transition-colors resize-none"
                  placeholder="How would you like to partner with us? What impact are you hoping to create?"
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-red-800 text-white hover:bg-red-700 transition-colors rounded-xl py-4 font-semibold text-lg"
              >
                Submit Partnership Inquiry
              </motion.button>
            </form>

            {/* Contact Information */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">Prefer to talk directly?</h3>
              <div className="flex flex-col sm:flex-row justify-center gap-6 text-center">
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:partnerships@neemafoundationkilifi.org" className="hover:text-red-800">
                    partnerships@neemafoundationkilifi.org
                  </a>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <a href="tel:+254700000000" className="hover:text-red-800">
                    +254 700 000 000
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Partnership;