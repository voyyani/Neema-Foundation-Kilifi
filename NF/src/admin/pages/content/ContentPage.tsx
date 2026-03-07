// Content Management Hub Page

import { Link } from 'react-router-dom';
import { Settings, Image, Layout, BookOpen, TrendingUp, Users, Handshake, Inbox } from 'lucide-react';

export default function ContentPage() {
  const contentSections = [
    {
      title: 'Programs',
      description: 'Manage foundation programs and initiatives',
      icon: Layout,
      href: '/admin/content/programs',
      color: 'bg-blue-500',
      tourId: 'content-programs-card',
    },
    {
      title: 'Hero Slides',
      description: 'Manage homepage hero section slides',
      icon: Image,
      href: '/admin/content/hero',
      color: 'bg-purple-500',
      tourId: 'content-hero-card',
    },
    {
      title: 'Stories',
      description: 'Share success stories and testimonials',
      icon: BookOpen,
      href: '/admin/content/stories',
      color: 'bg-orange-500',
      tourId: 'content-stories-card',
    },
    {
      title: 'Impact Metrics',
      description: 'Showcase your foundation\'s impact',
      icon: TrendingUp,
      href: '/admin/content/impact',
      color: 'bg-cyan-500',
      tourId: 'content-impact-card',
    },
    {
      title: 'Partners',
      description: 'Manage organizational partners',
      icon: Handshake,
      href: '/admin/content/partners',
      color: 'bg-green-500',
      tourId: 'content-partners-card',
    },
    {
      title: 'Board Members',
      description: 'Manage team and board member profiles',
      icon: Users,
      href: '/admin/content/board',
      color: 'bg-pink-500',
      tourId: 'content-board-card',
    },
    {
      title: 'Submissions',
      description: 'View contact form submissions and partnership inquiries',
      icon: Inbox,
      href: '/admin/content/submissions',
      color: 'bg-indigo-500',
      tourId: 'content-submissions-card',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <p className="text-gray-600 mt-2">
          Manage stories, impact metrics, partners, board members, and hero slides
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-tour="content-hub-grid">
        {contentSections.map((section) => (
          <Link
            key={section.href}
            to={section.href}
            data-tour={section.tourId}
            className="block bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${section.color} p-3 rounded-lg text-white`}>
                <section.icon className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
            <p className="text-sm text-gray-600">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
