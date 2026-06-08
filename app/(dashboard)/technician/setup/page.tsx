'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CheckCircle2,
  ChevronRight,
  Upload,
  Loader2,
  AlertCircle,
  FileText,
  DollarSign,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const AVAILABLE_SKILLS = [
  { id: 'plumbing', label: 'Plumbing', icon: '🔧' },
  { id: 'hvac', label: 'HVAC & Cooling', icon: '❄️' },
  { id: 'electrical', label: 'Electrical', icon: '⚡' },
  { id: 'carpentry', label: 'Carpentry', icon: '🪵' },
  { id: 'painting', label: 'Painting', icon: '🎨' },
  { id: 'locksmith', label: 'Locksmith', icon: '🔐' },
  { id: 'appliances', label: 'Appliance Repair', icon: '❄️' },
  { id: 'flooring', label: 'Flooring', icon: '🏠' },
  { id: 'landscaping', label: 'Landscaping', icon: '🌿' },
  { id: 'cleaning', label: 'Cleaning', icon: '🧹' },
];

export default function TechnicianSetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Step 2: Documents
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [certificateDocument, setCertificateDocument] = useState<File | null>(null);

  // Step 3: Hourly Rate
  const [hourlyRate, setHourlyRate] = useState('');

  // Step 4: Stripe Connect
  const [stripeConnecting, setStripeConnecting] = useState(false);

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    );
  };

  const handleFileUpload = (
    file: File,
    type: 'id' | 'certificate'
  ) => {
    if (type === 'id') {
      setIdDocument(file);
    } else {
      setCertificateDocument(file);
    }
    toast.success(`${type === 'id' ? 'ID' : 'Certificate'} uploaded successfully`);
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (selectedSkills.length === 0) {
        toast.error('Please select at least one skill');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!idDocument) {
        toast.error('Please upload your ID document');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Final submission
      handleSubmit();
    }
  };

  const handleConnectStripe = async () => {
    setStripeConnecting(true);
    try {
      const response = await fetch('/api/stripe/onboarding-link');
      if (response.ok) {
        const data = await response.json();
        window.open(data.url, '_blank');
        toast.success('Opened Stripe Connect onboarding');
      } else {
        toast.error('Failed to get Stripe onboarding link');
      }
    } catch (error) {
      toast.error('Failed to connect Stripe');
    } finally {
      setStripeConnecting(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/technician/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: selectedSkills,
          hourlyRate: hourlyRate || null,
        }),
      });

      if (response.ok) {
        toast.success('Setup complete! Welcome to Malaysia Co (Maintenance Services)');
        router.push('/dashboard/technician');
      } else {
        const err = await response.json();
        toast.error(err.error || 'Failed to complete setup');
      }
    } catch {
      toast.error('Failed to complete setup');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, label: 'Skills', completed: selectedSkills.length > 0 },
    { number: 2, label: 'Documents', completed: !!idDocument },
    { number: 3, label: 'Pricing', completed: !!hourlyRate || currentStep > 3 },
    { number: 4, label: 'Stripe', completed: false },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Malaysia Co (Maintenance Services)!</h1>
        <p className="text-gray-600 mb-6">
          Complete your profile to start accepting jobs
        </p>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm
                  transition-all cursor-pointer
                  ${
                    step.number === currentStep
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                      : step.completed
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                  }
                `}
                onClick={() => step.completed && setCurrentStep(step.number)}
              >
                {step.completed ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  step.number
                )}
              </motion.div>

              {idx < steps.length - 1 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    step.completed ? 'bg-green-200' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between text-xs font-medium text-gray-600 mb-8">
          {steps.map((step) => (
            <span key={step.number}>{step.label}</span>
          ))}
        </div>
      </div>

      {/* Step 1: Skills */}
      {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Select Your Skills</CardTitle>
              <CardDescription>
                Choose the services you can provide (select at least one)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_SKILLS.map((skill) => (
                  <motion.div
                    key={skill.id}
                    whileHover={{ scale: 1.02 }}
                    className="relative"
                  >
                    <input
                      type="checkbox"
                      id={skill.id}
                      checked={selectedSkills.includes(skill.id)}
                      onChange={() => handleSkillToggle(skill.id)}
                      className="sr-only"
                    />
                    <label
                      htmlFor={skill.id}
                      className={`
                        block p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${
                          selectedSkills.includes(skill.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-2xl">{skill.icon}</div>
                        <span className="font-medium text-gray-900">
                          {skill.label}
                        </span>
                        {selectedSkills.includes(skill.id) && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 ml-auto" />
                        )}
                      </div>
                    </label>
                  </motion.div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                  You can add or change your skills anytime in your profile settings
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" disabled>
                  Skip
                </Button>
                <Button onClick={handleNextStep} className="gap-2">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 2: Documents */}
      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Upload Verification Documents</CardTitle>
              <CardDescription>
                We need to verify your identity for safety
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ID Document */}
              <div>
                <Label className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Government ID / Passport *
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="id-upload"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files &&
                      handleFileUpload(e.target.files[0], 'id')
                    }
                    accept="image/*,.pdf"
                  />
                  <label htmlFor="id-upload" className="cursor-pointer">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium text-gray-900">
                        {idDocument ? idDocument.name : 'Click to upload'}
                      </p>
                      <p className="text-xs text-gray-600">
                        PNG, JPG, PDF (max 10MB)
                      </p>
                    </div>
                  </label>
                </div>
                {idDocument && (
                  <Badge className="mt-2 bg-green-100 text-green-800">
                    ✓ Uploaded
                  </Badge>
                )}
              </div>

              {/* Certificate (Optional) */}
              <div>
                <Label className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Professional Certificate (Optional)
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="cert-upload"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files &&
                      handleFileUpload(e.target.files[0], 'certificate')
                    }
                    accept="image/*,.pdf"
                  />
                  <label htmlFor="cert-upload" className="cursor-pointer">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium text-gray-900">
                        {certificateDocument
                          ? certificateDocument.name
                          : 'Click to upload'}
                      </p>
                      <p className="text-xs text-gray-600">
                        PNG, JPG, PDF (max 10MB)
                      </p>
                    </div>
                  </label>
                </div>
                {certificateDocument && (
                  <Badge className="mt-2 bg-green-100 text-green-800">
                    ✓ Uploaded
                  </Badge>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                  Documents are securely stored and used only for verification
                  purposes
                </p>
              </div>

              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  Back
                </Button>
                <Button onClick={handleNextStep} className="gap-2">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 3: Pricing */}
      {currentStep === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Set Your Hourly Rate</CardTitle>
              <CardDescription>
                This is optional - you can set fixed prices per job instead
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rate" className="font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Hourly Rate (Optional)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                    RM
                  </span>
                  <Input
                    id="rate"
                    type="number"
                    placeholder="0"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="pl-8"
                    min="0"
                    step="0.50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                    /hour
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Recommended: RM 50-200/hour depending on your expertise
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-900">
                  Most jobs on Malaysia Co (Maintenance Services) use fixed prices. Your hourly rate is
                  optional and can be changed later.
                </p>
              </div>

              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                >
                  Back
                </Button>
                <Button onClick={handleNextStep} className="gap-2">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 4: Stripe */}
      {currentStep === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Connect Stripe</CardTitle>
              <CardDescription>
                Set up your payment account to receive earnings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Why Stripe?
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ Secure payment processing</li>
                      <li>✓ Direct bank transfers</li>
                      <li>✓ Withdrawal anytime</li>
                      <li>✓ Detailed earnings reports</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">
                  Next, you'll create a Stripe account to:
                </h3>
                <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                  <li>Verify your identity and bank account</li>
                  <li>Set up direct transfers for your earnings</li>
                  <li>Access your earnings dashboard</li>
                </ol>
              </div>

              <Button
                onClick={handleConnectStripe}
                disabled={stripeConnecting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2 py-6"
              >
                {stripeConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Connect Stripe Account
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-600 text-center">
                You'll be redirected to Stripe's secure platform
              </p>

              <div className="flex justify-between gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Complete Setup
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
