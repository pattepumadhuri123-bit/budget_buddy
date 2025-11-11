import { useState } from 'react';
import { Users, Receipt, Mic, Keyboard, Mail, TrendingUp, Camera, Tag, DollarSign, Menu, X, ArrowRight, Check } from 'lucide-react';

type LandingPageProps = {
  onGetStarted: () => void;
};

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState('weekly');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SplitWise Bachelors</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <button
                onClick={onGetStarted}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 hover:-translate-y-0.5"
              >
                Get Started
              </button>
            </div>

            <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-white/10">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="block text-gray-300 hover:text-white transition-colors">How It Works</a>
              <a href="#pricing" className="block text-gray-300 hover:text-white transition-colors">Pricing</a>
              <button
                onClick={onGetStarted}
                className="w-full px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Managing Money with
                <span className="bg-gradient-to-r from-orange-400 to-pink-400 text-transparent bg-clip-text"> Roommates</span>,
                Made Simple
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Track expenses, split bills, and stay on budget - all in one place
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={onGetStarted}
                  className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center space-x-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold border-2 border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
                >
                  Join Existing Group
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square bg-gradient-to-br from-orange-400 to-pink-400 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg hover:scale-105 transition-transform">
                      <Users className="w-12 h-12" />
                    </div>
                  ))}
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white font-semibold">Monthly Expenses</span>
                    <span className="text-orange-400 font-bold text-xl">$1,245</span>
                  </div>
                  <div className="space-y-2">
                    {['Groceries', 'Utilities', 'Internet'].map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-300">{item}</span>
                        <span className="text-white font-medium">${[450, 380, 415][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-64 h-64 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-64 h-64 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-4">
            Everything You Need
          </h2>
          <p className="text-gray-400 text-center mb-16 text-lg">Powerful features designed for roommates</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Receipt, title: 'Scan & Upload Bills', desc: 'Take a photo or upload receipts. Our AI extracts all the details automatically', color: 'from-blue-500 to-cyan-500' },
              { icon: Mic, title: 'Voice Input', desc: 'Just speak your expenses naturally. "Spent $45 on groceries yesterday"', color: 'from-orange-500 to-pink-500' },
              { icon: Keyboard, title: 'Quick Manual Entry', desc: 'Type expenses in seconds with smart categorization and autocomplete', color: 'from-purple-500 to-pink-500' },
              { icon: Users, title: 'Group Management', desc: 'Create groups, invite roommates, and manage shared expenses effortlessly', color: 'from-green-500 to-emerald-500' },
              { icon: Mail, title: 'Gmail Reports', desc: 'Get beautifully formatted expense reports delivered to your inbox weekly', color: 'from-red-500 to-orange-500' },
              { icon: TrendingUp, title: 'Smart Analytics', desc: 'Visualize spending patterns and get insights on where your money goes', color: 'from-yellow-500 to-orange-500' }
            ].map((feature, i) => (
              <div key={i} className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-2">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-4">
            How It Works
          </h2>
          <p className="text-gray-400 text-center mb-16 text-lg">Get started in three simple steps</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Create or Join a Group', desc: 'Start a new group or join using a unique code from your roommates', color: 'from-blue-500 to-cyan-500' },
              { icon: Receipt, title: 'Track Your Expenses', desc: 'Scan receipts, speak, or type expenses. AI categorizes everything automatically', color: 'from-orange-500 to-pink-500' },
              { icon: Mail, title: 'Get Reports via Gmail', desc: 'Receive beautifully formatted expense reports delivered straight to your inbox', color: 'from-purple-500 to-pink-500' }
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-2 h-full">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {i + 1}
                  </div>
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-6 mt-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-400 text-center mb-12 text-lg">Choose the plan that works for you</p>

          <div className="flex justify-center mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-full p-1 border border-white/10">
              {[
                { id: 'monthly', label: 'Monthly' },
                { id: 'weekly', label: 'Weekly' }
              ].map((freq) => (
                <button
                  key={freq.id}
                  onClick={() => setSelectedFrequency(freq.id)}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    selectedFrequency === freq.id
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {freq.label}
                  {selectedFrequency === freq.id && (
                    <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">Save 20%</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Starter',
                price: selectedFrequency === 'monthly' ? '9.99' : '2.49',
                features: ['Up to 3 roommates', 'Basic expense tracking', 'Manual entry only', 'Monthly email reports', 'Basic analytics']
              },
              {
                name: 'Pro',
                price: selectedFrequency === 'monthly' ? '19.99' : '4.99',
                features: ['Up to 10 roommates', 'All tracking methods', 'AI receipt scanning', 'Weekly email reports', 'Advanced analytics', 'Priority support'],
                popular: true
              },
              {
                name: 'Enterprise',
                price: selectedFrequency === 'monthly' ? '39.99' : '9.99',
                features: ['Unlimited roommates', 'Everything in Pro', 'Voice input', 'Real-time sync', 'Custom categories', 'API access', 'Dedicated support']
              }
            ].map((plan, i) => (
              <div
                key={i}
                className={`bg-white/5 backdrop-blur-sm rounded-3xl p-8 border transition-all duration-300 hover:-translate-y-2 relative ${
                  plan.popular
                    ? 'border-orange-400 shadow-2xl shadow-orange-500/20'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400 ml-2">/{selectedFrequency === 'monthly' ? 'month' : 'week'}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGetStarted}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-lg hover:shadow-orange-500/50'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900/80 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">SplitWise Bachelors</span>
          </div>
          <p className="text-gray-400">Making shared expenses simple and stress-free</p>
          <p className="text-gray-500 text-sm mt-4">© 2025 SplitWise Bachelors. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
