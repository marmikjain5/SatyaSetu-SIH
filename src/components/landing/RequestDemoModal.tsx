import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { CheckCircle2, Building, ShieldCheck, Mail, Phone, User } from 'lucide-react';

interface RequestDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestDemoModal: React.FC<RequestDemoModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Shri Vikram Malhotra',
    designation: 'Joint Director of Consumer Affairs',
    department: 'State Legal Metrology Department',
    email: 'v.malhotra@gov.in',
    phone: '+91 98110 98765',
    orgType: 'Government Regulatory Authority',
    scale: '500,000+ Products / Month',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      // simulate success
    }, 400);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Request Regulatory Intelligence Briefing"
      subtitle="Authorized deployment preview for Central & State Consumer Protection Authorities"
      maxWidth="xl"
    >
      {submitted ? (
        <div className="py-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">Demonstration Request Dispatched</h4>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Thank you, {formData.name}. Our National Intelligence Team has provisioned a sandboxed workspace for{' '}
            <strong className="text-slate-900">{formData.department}</strong>. A technical officer will connect via NIC email.
          </p>
          <div className="pt-4">
            <Button variant="primary" size="md" onClick={handleReset}>
              Return to Platform
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
            <span className="text-slate-600">
              Direct access is granted to official government officials, enforcement bodies, and authorized testing agencies.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Official Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              icon={<User className="h-4 w-4" />}
              required
            />
            <Input
              label="Official Designation"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              icon={<Building className="h-4 w-4" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Official Email (gov.in / nic.in)"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              icon={<Mail className="h-4 w-4" />}
              required
            />
            <Input
              label="Contact Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              icon={<Phone className="h-4 w-4" />}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Department / Regulatory Authority
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Authority Type
              </label>
              <select
                value={formData.orgType}
                onChange={(e) => setFormData({ ...formData, orgType: e.target.value })}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option>Central Authority (CCPA / DoCA)</option>
                <option>State Legal Metrology Department</option>
                <option>FSSAI Food Safety Division</option>
                <option>National Consumer Helpline Partner</option>
                <option>Smart India Hackathon Jury Evaluation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Jurisdiction Scale
              </label>
              <select
                value={formData.scale}
                onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option>National Scope (All India)</option>
                <option>Zonal (North / South / East / West)</option>
                <option>State Specific Enforcement</option>
                <option>District Consumer Commission</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Submit Demo Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
