import { Link } from 'react-router-dom'
import { BookOpen, Code2, Layers, Shield, Puzzle, Layout, Cloud, ArrowRight, Target } from 'lucide-react'

const phases = [
  {
    id: 'fundamentals',
    title: 'Language Fundamentals',
    description: 'Master the building blocks of C++ and Java',
    icon: Code2,
    color: 'from-blue-500 to-blue-600',
    topics: 6,
    firstTopic: 'classes'
  },
  {
    id: 'oops',
    title: 'OOPs Concepts',
    description: 'Deep dive into Object-Oriented Programming',
    icon: Layers,
    color: 'from-purple-500 to-purple-600',
    topics: 5,
    firstTopic: 'encapsulation'
  },
  {
    id: 'solid',
    title: 'SOLID Principles',
    description: 'Write clean, maintainable code',
    icon: Shield,
    color: 'from-green-500 to-green-600',
    topics: 5,
    firstTopic: 'srp'
  },
  {
    id: 'design-patterns',
    title: 'Design Patterns',
    description: 'Proven solutions to common problems',
    icon: Puzzle,
    color: 'from-orange-500 to-orange-600',
    topics: 8,
    firstTopic: 'singleton'
  },
  {
    id: 'lld',
    title: 'Low-Level Design',
    description: 'Design classes and relationships',
    icon: Layout,
    color: 'from-pink-500 to-pink-600',
    topics: 5,
    firstTopic: 'parking-lot'
  },
  {
    id: 'hld',
    title: 'High-Level Design',
    description: 'Architect scalable systems',
    icon: Cloud,
    color: 'from-cyan-500 to-cyan-600',
    topics: 5,
    firstTopic: 'url-shortener'
  }
]

const features = [
  {
    title: 'Side-by-Side Comparison',
    description: 'Learn C++ and Java simultaneously with parallel examples',
    icon: '⚔️'
  },
  {
    title: '3 Difficulty Levels',
    description: 'Basic, Intermediate, and Advanced concepts for each topic',
    icon: '📊'
  },
  {
    title: 'Practice Questions',
    description: 'Hands-on exercises with solutions in both languages',
    icon: '💪'
  },
  {
    title: 'Progress Tracking',
    description: 'Track your learning journey and mark completed topics',
    icon: '📈'
  }
]

function Home() {
  return (
    <div className="max-w-6xl mx-auto pt-8 pb-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
          <Target className="w-4 h-4" />
          Master System Design from Fundamentals to Architecture
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Design Mastery
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          A comprehensive learning path from language fundamentals to high-level system design.
          Learn with <span className="text-cpp font-semibold">C++</span> and{' '}
          <span className="text-java font-semibold">Java</span> side by side.
        </p>

        <Link
          to="/topic/fundamentals/classes"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
        >
          <BookOpen className="w-5 h-5" />
          Start Learning
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <div className="text-3xl mb-2">{feature.icon}</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Learning Path */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          📚 Learning Path
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {phases.map((phase, index) => {
            const Icon = phase.icon
            return (
              <Link
                key={phase.id}
                to={`/topic/${phase.id}/${phase.firstTopic}`}
                className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all"
              >
                {/* Phase Number */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-400">
                  {index + 1}
                </div>

                <div className="p-6">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${phase.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {phase.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {phase.description}
                  </p>

                  {/* Topics Count */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      {phase.topics} topics
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

                {/* Bottom Gradient Bar */}
                <div className={`h-1 bg-gradient-to-r ${phase.color}`} />
              </Link>
            )
          })}
        </div>
      </div>

      {/* Language Comparison Preview */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          🔄 C++ vs Java - Learn Both!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Every concept is explained with examples in both languages, helping you understand the nuances and differences.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* C++ Preview */}
          <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="px-3 py-2 bg-cpp text-white text-sm font-medium">
              C++ Example
            </div>
            <pre className="p-4 bg-gray-900 text-gray-100 text-sm overflow-x-auto">
              <code>{`class Car {
private:
    string brand;
public:
    Car(string b) : brand(b) {}
    void drive() {
        cout << brand << " is driving";
    }
};`}</code>
            </pre>
          </div>

          {/* Java Preview */}
          <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="px-3 py-2 bg-java text-white text-sm font-medium">
              Java Example
            </div>
            <pre className="p-4 bg-gray-900 text-gray-100 text-sm overflow-x-auto">
              <code>{`public class Car {
    private String brand;
    
    public Car(String b) {
        this.brand = b;
    }
    public void drive() {
        System.out.println(brand + " is driving");
    }
}`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
