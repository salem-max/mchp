"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  AlertCircle,
  CheckCircle,
  Loader
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";

interface PaymentFormProps {
  jobId: string;
  amount: number;
  currency: string;
  technicianId: string;
  onSuccess?: () => void;
}

export default function PaymentForm({
  jobId,
  amount,
  currency,
  technicianId,
  onSuccess
}: PaymentFormProps) {
  const [email, setEmail] = useState("");
  const [cardName, setCardName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet">("card");

  // Create payment intent mutation
  const createPayment = trpc.payment.createPaymentIntent.useMutation({
    onSuccess: (data: any) => {
      // In a real app, this would open Stripe's payment modal
      toast.success("Payment processed successfully!");
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast.error("Payment failed. Please try again.");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !cardName) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsProcessing(true);
    try {
      await createPayment.mutateAsync({
        jobId,
        technicianId,
        amount,
        currency,
        email,
        paymentMethod
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Payment
          </CardTitle>
          <CardDescription>
            Amount due: {currency} {amount.toFixed(2)}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Method Selection */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 border rounded-lg transition-colors ${
                    paymentMethod === "card"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-muted border-gray-200"
                  }`}
                >
                  <CreditCard className="h-4 w-4 mb-1" />
                  <p className="text-sm font-medium">Credit Card</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("wallet")}
                  className={`p-3 border rounded-lg transition-colors ${
                    paymentMethod === "wallet"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-muted border-gray-200"
                  }`}
                >
                  <CreditCard className="h-4 w-4 mb-1" />
                  <p className="text-sm font-medium">Wallet</p>
                </button>
              </div>
            </div>

            {paymentMethod === "card" ? (
              <>
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Cardholder Name */}
                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name *</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />
                </div>

                {/* Card Details Placeholder */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600 mb-3">Card Details</p>
                  <div className="space-y-2">
                    <div className="h-10 bg-white border rounded flex items-center px-3">
                      <span className="text-xs text-gray-500">4242 4242 4242 4242</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-10 bg-white border rounded flex items-center px-3">
                        <span className="text-xs text-gray-500">MM/YY</span>
                      </div>
                      <div className="h-10 bg-white border rounded flex items-center px-3">
                        <span className="text-xs text-gray-500">CVC</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    💡 Test card: 4242 4242 4242 4242
                  </p>
                </div>
              </>
            ) : (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Available wallet balance: {currency} 250.00
                </AlertDescription>
              </Alert>
            )}

            {/* Security Note */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your payment information is securely processed by Stripe.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isProcessing || !email || (paymentMethod === "card" && !cardName)}
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay {currency} {amount.toFixed(2)}
                </>
              )}
            </Button>

            {/* Terms */}
            <p className="text-xs text-center text-muted-foreground">
              By clicking "Pay", you agree to our Terms of Service and authorize this charge to your payment method.
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
