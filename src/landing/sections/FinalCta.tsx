import React, { useState } from 'react';
import { Caret } from '../components/Caret';
import { Button } from '../components/Button';
import { Reveal } from '../components/Reveal';
import { TypeText } from '../components/TypeText';
import { ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const FinalCta: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const authenticated = isAuthenticated();
  const [headlineFinished, setHeadlineFinished] = useState(false);

  return (
    <section className="py-24 sm:py-32 bg-[var(--landing-accent)] text-[#090D0F] border-t-2 border-[#090D0F] select-none">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7">
        <Reveal>
          <div className="inline-block px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-tight bg-[#090D0F] text-[var(--landing-accent)] uppercase mb-2">
            ship it tonight
          </div>
          <h2
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#090D0F] leading-[0.98]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <TypeText
              text="got an idea? type it in"
              profile="display"
              showCaret={true}
              caretVariant="dark"
              keepCaretBlinking={true}
              onComplete={() => setHeadlineFinished(true)}
            />
          </h2>
        </Reveal>

        <Reveal delayMs={100}>
          <p className="text-base sm:text-lg text-[#253037] max-w-xl mx-auto leading-relaxed font-sans font-medium">
            <TypeText
              text="describe what you want to build and watch voltrix synthesize complete, editable react code in front of your eyes."
              profile="body"
              showCaret={false}
              delayMs={140}
            />
          </p>
        </Reveal>

        <Reveal delayMs={160}>
          <div
            className={`flex flex-wrap items-center justify-center gap-4 pt-4 transition-transform duration-300 ${
              headlineFinished ? 'animate-bounce-short' : ''
            }`}
          >
            <Button
              to={authenticated ? '/projects' : '/signup'}
              variant="secondary"
              size="lg"
              magnetic
              className="!bg-[#090D0F] !text-[var(--landing-accent)] !border-[#090D0F] hover:!bg-[#152026] text-base px-8 h-13 shadow-xl"
            >
              <span>Launch App Builder</span>
              <ArrowRight className="w-4 h-4 text-[var(--landing-accent)]" />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
