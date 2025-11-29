import { Shield, CheckCircle, Clock, Award } from 'lucide-react';

export function WhyZEMO() {
  const features = [
    {
      icon: Shield,
      title: 'Comprehensive Insurance',
      description:
        'Every trip is covered with up to K500,000 in liability protection and damage coverage',
      color: 'bg-blue-500',
    },
    {
      icon: CheckCircle,
      title: 'Verified Community',
      description:
        'All hosts and renters are verified with ID checks and secure payment processing',
      color: 'bg-green-500',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description:
        'Our dedicated team is always available to help you with any questions or issues',
      color: 'bg-purple-500',
    },
    {
      icon: Award,
      title: 'Quality Guarantee',
      description: 'All vehicles undergo safety inspections and must meet our quality standards',
      color: 'bg-yellow-500',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why choose ZEMO?
          </h2>
          <p className="text-lg text-gray-600">
            We're building Zambia's most trusted car sharing community with safety, convenience, and
            quality at the forefront
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div
                className={`w-14 h-14 ${feature.color} rounded-lg flex items-center justify-center mb-4`}
              >
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-2">500+</div>
            <div className="text-gray-600">Available Cars</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-2">5,000+</div>
            <div className="text-gray-600">Completed Trips</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-2">98%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-2">K500K</div>
            <div className="text-gray-600">Insurance Coverage</div>
          </div>
        </div>
      </div>
    </section>
  );
}
