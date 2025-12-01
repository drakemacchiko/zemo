'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Accordion } from '@/components/ui/Accordion';

interface DescriptionAccordionProps {
  description: string;
  defaultOpen?: boolean;
}

export function DescriptionAccordion({ description, defaultOpen = true }: DescriptionAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Truncate description if it's too long
  const shouldTruncate = description.length > 300;
  const displayedDescription = shouldTruncate && !isExpanded 
    ? description.slice(0, 300) + '...' 
    : description;

  return (
    <Accordion
      title="Description"
      icon={<FileText className="w-5 h-5" />}
      defaultOpen={defaultOpen}
      alwaysOpen={true}
    >
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {displayedDescription}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-zemo-yellow hover:text-yellow-600 font-medium mt-2"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </Accordion>
  );
}
