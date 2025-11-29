import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn('bg-white rounded-lg shadow-md', className)} {...props} />;
});

Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn('p-6 border-b border-gray-200', className)} {...props} />;
});

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return <h3 ref={ref} className={cn('text-xl font-bold text-gray-900', className)} {...props} />;
  }
);

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return <p ref={ref} className={cn('text-sm text-gray-600 mt-1', className)} {...props} />;
});

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn('p-6', className)} {...props} />;
});

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn('p-6 border-t border-gray-200', className)} {...props} />;
});

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
