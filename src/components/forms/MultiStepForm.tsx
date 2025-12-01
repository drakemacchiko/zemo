'use client';

import React, { useState, useCallback, ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  component: ReactNode;
  validate?: () => Promise<boolean> | boolean;
  optional?: boolean;
}

interface MultiStepFormProps {
  steps: FormStep[];
  onComplete: (data: any) => void | Promise<void>;
  onCancel?: () => void;
  initialStep?: number;
  showProgress?: boolean;
  saveProgress?: boolean;
  storageKey?: string;
  className?: string;
}

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  onComplete,
  onCancel,
  initialStep = 0,
  showProgress = true,
  saveProgress = false,
  storageKey = 'multi-step-form',
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved progress on mount
  React.useEffect(() => {
    if (saveProgress && typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) {
          const { step, completed } = JSON.parse(saved);
          setCurrentStep(step);
          setCompletedSteps(new Set(completed));
        }
      } catch (error) {
        console.error('Failed to load form progress:', error);
      }
    }
  }, [saveProgress, storageKey]);

  // Save progress on step change
  React.useEffect(() => {
    if (saveProgress && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            step: currentStep,
            completed: Array.from(completedSteps),
          })
        );
      } catch (error) {
        console.error('Failed to save form progress:', error);
      }
    }
  }, [currentStep, completedSteps, saveProgress, storageKey]);

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = useCallback(async () => {
    if (!currentStepData) return;
    setError(null);
    setIsValidating(true);

    try {
      // Validate current step if validation function provided
      if (currentStepData.validate) {
        const isValid = await currentStepData.validate();
        if (!isValid) {
          setError('Please complete all required fields correctly');
          setIsValidating(false);
          return;
        }
      }

      // Mark step as completed
      setCompletedSteps((prev) => new Set(prev).add(currentStep));

      // Move to next step or complete
      if (isLastStep) {
        await onComplete({});
        // Clear saved progress
        if (saveProgress && typeof window !== 'undefined') {
          sessionStorage.removeItem(storageKey);
        }
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Form validation error:', error);
    } finally {
      setIsValidating(false);
    }
  }, [currentStep, currentStepData, isLastStep, onComplete, saveProgress, storageKey]);

  const handleBack = useCallback(() => {
    setError(null);
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirstStep]);

  const handleStepClick = useCallback(
    (stepIndex: number) => {
      // Allow jumping to completed steps or the next step
      if (completedSteps.has(stepIndex) || stepIndex === currentStep + 1) {
        setCurrentStep(stepIndex);
        setError(null);
      }
    },
    [completedSteps, currentStep]
  );

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Progress Indicator */}
      {showProgress && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step Indicators (Desktop) */}
          <div className="hidden md:flex items-center justify-between px-6 py-4">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = completedSteps.has(index);
              const isClickable = isCompleted || index === currentStep + 1;

              return (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    onClick={() => handleStepClick(index)}
                    disabled={!isClickable}
                    className={`flex items-center gap-3 transition-all ${
                      isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                        isActive
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : isCompleted
                          ? 'border-green-600 bg-green-600 text-white'
                          : 'border-gray-300 bg-white text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="text-left">
                      <div
                        className={`text-sm font-medium ${
                          isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                        }`}
                      >
                        {step.title}
                      </div>
                      {step.description && (
                        <div className="text-xs text-gray-500">{step.description}</div>
                      )}
                    </div>
                  </button>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-4 bg-gray-200">
                      <div
                        className={`h-full transition-all ${
                          isCompleted ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Step Title (Mobile) */}
          <div className="md:hidden px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">
                  Step {currentStep + 1} of {steps.length}
                </div>
                <div className="text-base font-semibold text-gray-900">
                  {currentStepData?.title}
                </div>
              </div>
              {currentStepData?.optional && (
                <span className="text-xs text-gray-500">Optional</span>
              )}
            </div>
            {currentStepData?.description && (
              <p className="text-sm text-gray-600 mt-1">{currentStepData.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 md:px-6 md:py-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          {currentStepData?.component}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 sticky bottom-0">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          {/* Back Button */}
          {!isFirstStep ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isValidating}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
          )}

          {/* Next/Complete Button */}
          <button
            type="button"
            onClick={handleNext}
            disabled={isValidating}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {isValidating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isLastStep ? (
              <>
                <Check className="w-5 h-5" />
                <span>Complete</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
