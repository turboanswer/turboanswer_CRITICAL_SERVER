import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  const currentDate = new Date().toLocaleDateString();

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-blue-400 hover:text-blue-300 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold">Privacy Policy & Terms of Use</h1>
        </div>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          {/* Effective Date */}
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <p className="text-sm text-gray-400">
              <strong>Effective Date:</strong> {currentDate}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              <strong>Last Updated:</strong> {currentDate}
            </p>
          </div>

          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Introduction</h2>
            <p>
              Welcome to Turbo Answer, an advanced AI assistant application ("Service", "Platform", "Application"). 
              This Privacy Policy and Terms of Use ("Policy") governs your access to and use of Turbo Answer's 
              services, website, and mobile applications. By accessing or using our Service, you acknowledge 
              that you have read, understood, and agree to be bound by this Policy.
            </p>
          </section>

          {/* Critical Refund Policy */}
          <section className="bg-red-950 border border-red-700 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-red-300 mb-4">🚨 CRITICAL REFUND LIMITATIONS</h2>
            <div className="space-y-4">
              <div className="bg-red-900 p-4 rounded border border-red-600">
                <h3 className="text-xl font-semibold text-red-200 mb-2">10-Day Refund Window</h3>
                <p className="text-red-100">
                  <strong>MANDATORY REFUND DEADLINE:</strong> All refund requests must be submitted within 
                  <span className="font-bold text-red-200"> TEN (10) CALENDAR DAYS</span> from the date of purchase. 
                  After this 10-day period expires, <strong>NO REFUNDS WILL BE PROCESSED</strong> under any 
                  circumstances, including but not limited to technical issues, dissatisfaction with service, 
                  change of mind, or force majeure events.
                </p>
              </div>
              
              <div className="bg-red-900 p-4 rounded border border-red-600">
                <h3 className="text-xl font-semibold text-red-200 mb-2">Zero Tolerance Policy</h3>
                <p className="text-red-100">
                  <strong>PERMANENT BAN WITHOUT REFUND:</strong> Users engaging in sexual content, explicit 
                  conversations, illegal activities, or prohibited content will be <span className="font-bold text-red-200">
                  PERMANENTLY BANNED IMMEDIATELY</span> with <strong>ZERO REFUND ELIGIBILITY</strong>. This 
                  includes partial refunds, prorated refunds, or future service credits.
                </p>
              </div>
            </div>
          </section>

          {/* Prohibited Content and Activities */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Prohibited Content and Activities</h2>
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <h3 className="text-xl font-semibold text-orange-300 mb-3">Strictly Forbidden Activities</h3>
              <p className="mb-4">
                The following activities are <strong>ABSOLUTELY PROHIBITED</strong> and will result in 
                immediate account termination without refund:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Sexual Content:</strong> Any sexually explicit conversations, adult content discussions, 
                romantic or intimate dialogue, or requests for sexual advice or information</li>
                <li><strong>Illegal Activities:</strong> Discussion of illegal drug use, criminal activities, 
                fraud, hacking, violence, terrorism, or any content that violates local, state, or federal laws</li>
                <li><strong>Harassment:</strong> Abusive language, threats, stalking, doxxing, or targeting 
                individuals or groups with harmful content</li>
                <li><strong>Hate Speech:</strong> Content promoting discrimination, violence, or hostility 
                against individuals or groups based on race, religion, gender, sexual orientation, or other characteristics</li>
                <li><strong>Misinformation:</strong> Deliberately spreading false information, conspiracy theories, 
                or dangerous medical advice</li>
                <li><strong>Copyright Infringement:</strong> Sharing copyrighted material without authorization 
                or requesting assistance with piracy</li>
                <li><strong>Privacy Violations:</strong> Sharing personal information of others without consent 
                or attempting to extract private data</li>
                <li><strong>System Abuse:</strong> Attempting to hack, exploit, or overwhelm our systems, 
                or using the service for unauthorized commercial purposes</li>
              </ul>
            </div>
          </section>

          {/* Data Collection and Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Data Collection and Privacy</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-200">Information We Collect</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Account Information:</strong> Username, email address, subscription status, and payment information</li>
                <li><strong>Conversation Data:</strong> All messages, queries, and AI responses for service improvement and moderation</li>
                <li><strong>Usage Analytics:</strong> Session duration, feature usage, error logs, and performance metrics</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
                <li><strong>Location Data:</strong> General geographic location for localized services (when requested)</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-200 mt-6">How We Use Your Data</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Providing and improving AI assistant services</li>
                <li>Monitoring compliance with this Policy and Terms of Service</li>
                <li>Processing payments and managing subscriptions</li>
                <li>Providing customer support and technical assistance</li>
                <li>Analyzing usage patterns for service optimization</li>
                <li>Preventing fraud, abuse, and security threats</li>
                <li>Complying with legal obligations and law enforcement requests</li>
              </ul>
            </div>
          </section>

          {/* Content Monitoring and Moderation */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Content Monitoring and Moderation</h2>
            <div className="bg-yellow-950 border border-yellow-700 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-yellow-300 mb-3">Automated and Human Review</h3>
              <p className="mb-4">
                We employ both automated systems and human moderators to monitor all conversations and content 
                shared through our platform. This monitoring includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Real-time analysis of all messages for prohibited content</li>
                <li>Periodic manual review of flagged conversations</li>
                <li>Pattern recognition for detecting policy violations</li>
                <li>Escalation to senior moderation team for serious violations</li>
                <li>Documentation of violations for potential legal action</li>
              </ul>
              <p className="mt-4 text-yellow-200">
                <strong>Important:</strong> By using our service, you consent to this monitoring and acknowledge 
                that conversations are not private when they violate our terms.
              </p>
            </div>
          </section>

          {/* Account Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Account Termination</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-200">Immediate Termination</h3>
              <p>
                We reserve the right to immediately suspend or terminate your account without prior notice 
                for any violation of this Policy. Terminated accounts will lose access to all services, 
                conversation history, and premium features without compensation.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-200">Appeal Process</h3>
              <p>
                Users may submit one appeal within 30 days of account termination. Appeals must include 
                detailed explanation and acknowledgment of policy violations. Appeals for sexual or illegal 
                content violations will not be considered under any circumstances.
              </p>
            </div>
          </section>

          {/* Payment Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Payment Terms and Billing</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-200">Subscription Billing</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All subscriptions are billed in advance on a monthly or annual basis</li>
                <li>Payments are processed through secure third-party payment processors</li>
                <li>Failed payments may result in service suspension after grace period</li>
                <li>Price changes will be communicated 30 days in advance</li>
                <li>Currency conversion fees may apply for international transactions</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-200">Promotional Codes</h3>
              <p>
                Promotional codes and discounts are subject to specific terms and expiration dates. 
                Promotional pricing does not extend refund periods or modify prohibited content policies.
              </p>
            </div>
          </section>

          {/* Legal Compliance */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Legal Compliance and Law Enforcement</h2>
            <div className="bg-blue-950 border border-blue-700 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-300 mb-3">Cooperation with Authorities</h3>
              <p className="mb-4">
                We fully cooperate with law enforcement agencies and legal authorities when required by law. 
                This may include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Providing user data and conversation logs in response to valid legal requests</li>
                <li>Reporting suspected illegal activities to appropriate authorities</li>
                <li>Preserving evidence of criminal activity discovered through our monitoring</li>
                <li>Assisting in investigations related to platform abuse or criminal behavior</li>
              </ul>
              <p className="mt-4 text-blue-200">
                <strong>Disclaimer:</strong> We are not responsible for legal consequences resulting from 
                user violations of local, state, or federal laws.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Limitation of Liability</h2>
            <div className="space-y-4">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, TURBO ANSWER SHALL NOT BE LIABLE FOR ANY 
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Loss of profits, data, or business opportunities</li>
                <li>Service interruptions or technical failures</li>
                <li>Damages resulting from reliance on AI-generated content</li>
                <li>Third-party actions or content accessed through our platform</li>
                <li>Costs of procurement of substitute services</li>
              </ul>
              <p className="mt-4">
                Our total liability for any claims shall not exceed the amount paid by you for the service 
                during the twelve (12) months preceding the claim.
              </p>
            </div>
          </section>

          {/* Updates and Modifications */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Policy Updates and Modifications</h2>
            <div className="space-y-4">
              <p>
                We reserve the right to modify this Privacy Policy and Terms of Use at any time. Material 
                changes will be communicated through:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Email notifications to registered users</li>
                <li>In-app notifications and banners</li>
                <li>Updates to this policy page with revised effective dates</li>
                <li>Service announcements for significant changes</li>
              </ul>
              <p className="mt-4">
                Continued use of the service after policy updates constitutes acceptance of the revised terms. 
                Users who disagree with updated terms must discontinue service use and may request account deletion.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Contact Information</h2>
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <h3 className="text-xl font-semibold text-gray-200 mb-3">Customer Support</h3>
              <ul className="space-y-2">
                <li><strong>Email:</strong> turboaswer@hotmail.com</li>
                <li><strong>Phone:</strong> (201) 691-8466</li>
                <li><strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST</li>
                <li><strong>Emergency Contact:</strong> Available 24/7 for critical security issues</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-200 mb-3 mt-6">Legal and Compliance</h3>
              <p>
                For legal inquiries, data protection requests, or compliance matters, please contact us 
                through the above channels with "LEGAL" in the subject line for priority handling.
              </p>
            </div>
          </section>

          {/* Final Acknowledgment */}
          <section className="bg-gray-900 border border-gray-700 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">User Acknowledgment</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing or using Turbo Answer, you acknowledge that you have read, understood, and agree 
              to be bound by this comprehensive Privacy Policy and Terms of Use. You specifically acknowledge 
              understanding of the <strong>10-day refund limitation</strong> and the <strong>zero-tolerance 
              policy for sexual and illegal content</strong> that results in permanent ban without refund. 
              You further acknowledge that all conversations may be monitored for compliance and that 
              violations may result in immediate account termination and potential legal consequences.
            </p>
            <p className="text-gray-400 text-sm mt-4">
              This policy constitutes a legally binding agreement between you and Turbo Answer. If you do 
              not agree with any part of this policy, you must immediately discontinue use of our services.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}