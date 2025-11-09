import Link from 'next/link';
import { ArrowRight, Mail, MessageSquare, Zap, Shield, TrendingUp, Users, Check, Sparkles } from 'lucide-react';
import { MapleLogo } from '@/components/ui/logo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white/50 backdrop-blur-sm fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <MapleLogo className="h-8 w-8" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Maple</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition">Pricing</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition">How it Works</a>
              <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 transition">
                Login
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Customer Support
            <span className="block text-transparent bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text">Powered by Intelligence</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Maple uses advanced AI to understand your customers and draft personalized responses in your voice.
            Turn hours of email work into minutes. Built for founders who care about quality support.
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Starting at just $30/month • 14-day free trial • No credit card required
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition inline-flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a
              href="#demo"
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition"
            >
              Watch Demo
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500">14-day free trial. No credit card required.</p>
        </div>
      </section>

      {/* What is Maple Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            What is Maple?
          </h2>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Maple is an intelligent customer support platform that combines the power of AI with human oversight.
            We use Claude AI by Anthropic to read, understand, and respond to your customer emails—but you stay in control.
          </p>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Think of it as having a tireless assistant who knows your business inside and out. Maple learns your brand voice,
            builds a knowledge base from your conversations, and drafts responses that sound like you wrote them.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-2">10x</div>
              <div className="text-sm text-gray-700">Faster response times on average</div>
            </div>
            <div className="p-6 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-sm text-gray-700">Customer satisfaction maintained</div>
            </div>
            <div className="p-6 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-2">20hrs</div>
              <div className="text-sm text-gray-700">Saved per week for small teams</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Scale Support
            </h2>
            <p className="text-xl text-gray-600">
              Powerful AI meets intuitive design
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Sparkles className="h-8 w-8 text-blue-600" />}
              title="AI-Powered Responses"
              description="Claude AI reads every message, understands context, and drafts personalized responses that match your brand voice perfectly."
            />
            <FeatureCard
              icon={<Mail className="h-8 w-8 text-blue-600" />}
              title="Multi-Inbox Support"
              description="Connect Gmail, Outlook, or custom email. Manage all customer conversations in one place."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8 text-blue-600" />}
              title="Real-Time Updates"
              description="Instant notifications for new messages. Never miss an important customer inquiry."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-blue-600" />}
              title="Learning Knowledge Base"
              description="AI automatically extracts insights from conversations, building a knowledge base that makes every response smarter than the last."
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8 text-blue-600" />}
              title="Performance Analytics"
              description="Track response times, customer satisfaction, AI confidence scores, and identify trends in your support conversations."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-blue-600" />}
              title="Team Collaboration"
              description="Review, edit, and approve automated responses. Keep your team in control with smart assistance."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in minutes, not hours
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Connect Your Email"
              description="Link your Gmail, Outlook, or custom email in seconds with secure OAuth authentication."
            />
            <StepCard
              number="2"
              title="Train Your AI"
              description="Tell Maple about your business, add FAQs, and define your brand voice. The AI learns from every interaction."
            />
            <StepCard
              number="3"
              title="Review & Send"
              description="AI drafts appear instantly for every new message. Review, edit, or approve with one click. You're always in control."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard
              name="Starter"
              price="$30"
              description="Perfect for solo founders"
              features={[
                '1 email inbox',
                '500 AI-drafted messages/month',
                'Brand voice training',
                'Auto-learning knowledge base',
                'Email support',
              ]}
              cta="Start Free Trial"
              popular={false}
            />
            <PricingCard
              name="Pro"
              price="$79"
              description="For small teams"
              features={[
                '5 email inboxes',
                '2,000 smart messages/month',
                'Everything in Starter',
                'Team collaboration',
                'Priority support',
                'Advanced analytics',
              ]}
              cta="Start Free Trial"
              popular={true}
            />
            <PricingCard
              name="Business"
              price="$149"
              description="Growing companies"
              features={[
                'Unlimited inboxes',
                'Unlimited smart messages',
                'Everything in Pro',
                'Custom automation training',
                'API access',
                'Dedicated support',
              ]}
              cta="Start Free Trial"
              popular={false}
            />
          </div>

          <p className="text-center mt-8 text-gray-600">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* Why Maple Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Maple?
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Built by Founders, for Founders</h3>
              <p className="text-gray-700 mb-4">
                We know what it's like to be drowning in customer emails while trying to build a product.
                Maple was created to solve that exact problem—give you the power of a support team without the cost.
              </p>
              <p className="text-gray-700">
                Unlike generic chatbots that frustrate customers, Maple generates thoughtful, helpful responses
                that maintain your personal touch. Your customers won't know it's AI—they'll just notice you're
                more responsive than ever.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">The Technology Behind Maple</h3>
              <p className="text-gray-700 mb-4">
                Maple uses Claude by Anthropic—one of the most advanced AI models available—to understand
                context, nuance, and intent in customer messages. But we don't just throw AI at the problem.
              </p>
              <p className="text-gray-700">
                Our platform combines AI intelligence with your knowledge, your voice, and your values.
                Every response is reviewed before sending (unless you enable auto-send), ensuring quality stays high
                while your workload drops dramatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Customer Support?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of founders using AI to deliver better support, faster
          </p>
          <Link
            href="/auth/register"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition inline-flex items-center"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <MapleLogo className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-bold text-white">Maple</span>
              </div>
              <p className="text-sm">
                Smart customer support for modern teams.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            <p>&copy; 2024 Maple. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="relative">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
          {number}
        </div>
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  cta,
  popular,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
}) {
  return (
    <div className={`relative p-8 rounded-xl border-2 ${popular ? 'border-blue-600 shadow-xl scale-105' : 'border-gray-200'}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex items-baseline justify-center">
          <span className="text-5xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-600 ml-2">/month</span>
        </div>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/auth/register"
        className={`block w-full text-center py-3 rounded-lg font-semibold transition ${
          popular
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
