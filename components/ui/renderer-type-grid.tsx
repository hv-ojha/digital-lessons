'use client';

import { RendererTypeCard } from './renderer-type-card';
import {
  Sparkles,
  Brain,
  CreditCard,
  Calculator,
  BookOpen,
  Gamepad2,
  Link2,
  Layers
} from 'lucide-react';

export interface RendererType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  isRecommended?: boolean;
  examples?: string[];
}

// Available renderer types with metadata
export const RENDERER_TYPES: RendererType[] = [
  {
    id: 'ai-decide',
    title: 'AI Decides',
    description: 'Let AI pick the best format for your topic',
    icon: <Sparkles className="w-8 h-8 text-white" />,
    gradient: 'bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500',
    isRecommended: true,
    examples: [
      "A comprehensive guide to photosynthesis with diagrams and examples",
      "A detailed lesson on the American Revolutionary War with timeline",
      "An interactive tutorial on solving quadratic equations step by step"
    ]
  },
  {
    id: 'quiz',
    title: 'Quiz',
    description: 'Test knowledge with multiple choice questions',
    icon: <Brain className="w-8 h-8 text-white" />,
    gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
    examples: [
      "Create a quiz about the solar system with 10 questions",
      "Quiz me on World War II major events and dates",
      "Test my knowledge of basic chemistry elements"
    ]
  },
  {
    id: 'flashcard',
    title: 'Flashcards',
    description: 'Flip cards to learn and memorize concepts',
    icon: <CreditCard className="w-8 h-8 text-white" />,
    gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
    examples: [
      "Flashcards for Spanish vocabulary words and phrases",
      "Biology flashcards about cell structure and organelles",
      "Geography flashcards for world capitals"
    ]
  },
  {
    id: 'math',
    title: 'Math Practice',
    description: 'Solve problems with step-by-step guidance',
    icon: <Calculator className="w-8 h-8 text-white" />,
    gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
    examples: [
      "Practice long division with remainders",
      "Algebra problems solving for x",
      "Geometry area and perimeter calculations"
    ]
  },
  {
    id: 'reading',
    title: 'Reading',
    description: 'Comprehension passages with questions',
    icon: <BookOpen className="w-8 h-8 text-white" />,
    gradient: 'bg-gradient-to-br from-green-500 to-green-600',
    examples: [
      "Reading comprehension about the life cycle of butterflies",
      "Historical passage about ancient Egypt with questions",
      "Science article on renewable energy sources"
    ]
  },
  {
    id: 'interactive',
    title: 'Interactive',
    description: 'Hands-on step-by-step activities',
    icon: <Gamepad2 className="w-8 h-8 text-white" />,
    gradient: 'bg-gradient-to-br from-pink-500 to-pink-600',
    examples: [
      "Interactive science experiment: grow your own crystals",
      "Build a simple electrical circuit step by step",
      "Create your own story with choices and outcomes"
    ]
  },
  {
    id: 'matching',
    title: 'Matching',
    description: 'Connect related concepts and pairs',
    icon: <Link2 className="w-8 h-8 text-white" />,
    gradient: 'bg-gradient-to-br from-teal-500 to-teal-600',
    examples: [
      "Match countries to their capitals",
      "Connect animals to their habitats",
      "Pair scientists with their discoveries"
    ]
  },
  {
    id: 'flexible',
    title: 'Flexible Mix',
    description: 'Combined format with multiple content types',
    icon: <Layers className="w-8 h-8 text-white" />,
    gradient: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
    examples: [
      "Comprehensive lesson mixing text, visuals, and questions",
      "Story-based learning with activities and examples",
      "Tutorial with explanations, demos, and practice"
    ]
  },
];

interface RendererTypeGridProps {
  selectedType: string;
  onTypeSelect: (typeId: string) => void;
}

/**
 * Grid Layout for Renderer Type Selection
 *
 * UX Features:
 * - Responsive grid (2 cols mobile, 3-4 cols desktop)
 * - AI Decides highlighted and first
 * - Clear visual hierarchy
 * - Touch-friendly on mobile
 */
export function RendererTypeGrid({ selectedType, onTypeSelect }: RendererTypeGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {RENDERER_TYPES.map((type) => (
        <RendererTypeCard
          key={type.id}
          id={type.id}
          title={type.title}
          description={type.description}
          icon={type.icon}
          gradient={type.gradient}
          isSelected={selectedType === type.id}
          isRecommended={type.isRecommended}
          onClick={() => onTypeSelect(type.id)}
        />
      ))}
    </div>
  );
}
