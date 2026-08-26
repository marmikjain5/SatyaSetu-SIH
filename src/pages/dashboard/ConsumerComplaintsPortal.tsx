import React, { useState } from 'react';
import {
  MessageSquareWarning,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  Send,
} from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';
import { Complaint, PlatformType } from '../../types/compliance';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

export const ConsumerComplaintsPortal: React.FC = () => {
  const { complaints, addComplaint } = useComplianceStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // New Grievance Form State
  const [newComplaintData, setNewComplaintData] = useState({
    consumerName: 'Rajesh Khanna',
    consumerEmail: 'rajesh.khanna@gmail.com',
    consumerPhone: '+91 98200 12345',
    productName: 'NutriPro Gold 100% Whey 1kg',
    brand: 'NutriPro Labs',
    platform: 'Amazon' as PlatformType,
    orderNumber: 'OD-991-00214-99',
    category: 'Price Gouging / MRP Violation' as Complaint['category'],
    description: 'Found dual price stickers with inflated MRP of Rs 2,999 over original Rs 1,999 printed stamp.',
    priority: 'Urgent' as Complaint['priority'],
    sentimentScore: 0.92,
    aiMatchedRule: 'Legal Metrology (Packaged Commodities) Rules 2011 - Rule 18(2)',
    evidenceUrls: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'],
  });

  const statuses = ['All', 'New', 'Triaged', 'Investigation', 'Notice Dispatched', 'Resolved'];

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.consumerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addComplaint(newComplaintData);
    setIsSubmitModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 w-fit">
            <MessageSquareWarning className="h-3.5 w-3.5" />
            <span>National Consumer Helpline (NCH 1915) NLP Bridge</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Consumer Grievance & Complaint Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time ingestion of citizen grievances with NLP sentiment scoring and statutory rule linkage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => setIsSubmitModalOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Lodge New Grievance</span>
          </Button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Active Complaints</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">{complaints.length} Filed</div>
          <span className="text-[11px] text-amber-600 font-medium">Auto-Triaged via AI</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Average SLA Resolution</span>
          <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">4.2 Days</div>
          <span className="text-[11px] text-emerald-600 font-medium">85% Within Benchmark</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-mono text-slate-500 uppercase">High Frustration Sentiment</span>
          <div className="text-2xl font-bold text-red-600 font-mono mt-1">74%</div>
          <span className="text-[11px] text-red-700 font-medium">Prioritized for CCPA</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Refunds Dispatched</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">₹34.8 Lakhs</div>
          <span className="text-[11px] text-slate-500">Citizen Recoveries</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8">
              <Input
                placeholder="Search Ticket ID, Consumer Name, Product, or Brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                className="text-xs"
              />
            </div>
            <div className="md:col-span-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    Status: {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <MessageSquareWarning className="h-4 w-4 text-slate-700" />
            <span>Grievance Ingestion Stream ({filteredComplaints.length})</span>
          </CardTitle>
          <span className="text-xs font-mono text-slate-500">Linked to CCPA Adjudication Queue</span>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Ticket & Citizen</th>
                <th className="px-3 py-3">Product & Platform</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Sentiment & Urgency</th>
                <th className="px-3 py-3">Matched Rule</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.map((cmp) => (
                <tr
                  key={cmp.id}
                  onClick={() => setSelectedComplaint(cmp)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-mono text-blue-700 font-bold">{cmp.ticketId}</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{cmp.consumerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{cmp.submittedAt}</div>
                  </td>

                  <td className="px-3 py-3 max-w-xs">
                    <div className="font-medium text-slate-900 line-clamp-1">{cmp.productName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {cmp.brand} • {cmp.platform} (Order: {cmp.orderNumber})
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                      {cmp.category}
                    </span>
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2 font-mono">
                      <div className="w-12 bg-slate-200 rounded-full h-1.5">
                        <div
                          className="bg-red-600 h-1.5 rounded-full"
                          style={{ width: `${Math.round(cmp.sentimentScore * 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-red-700">
                        {Math.round(cmp.sentimentScore * 100)}%
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize">{cmp.priority} Priority</span>
                  </td>

                  <td className="px-3 py-3 max-w-xs">
                    <span className="text-[11px] text-slate-700 line-clamp-2">{cmp.aiMatchedRule}</span>
                  </td>

                  <td className="px-3 py-3">
                    <Badge
                      variant={
                        cmp.status === 'Resolved'
                          ? 'success'
                          : cmp.status === 'Notice Dispatched'
                          ? 'danger'
                          : cmp.status === 'Investigation'
                          ? 'warning'
                          : 'secondary'
                      }
                      size="sm"
                    >
                      {cmp.status}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600 gap-1">
                      <span>View</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Grievance Dossier: ${selectedComplaint.ticketId}`}
          subtitle={`Lodged by ${selectedComplaint.consumerName} (${selectedComplaint.consumerEmail})`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono">
              <div>
                <span className="text-slate-400 uppercase text-[10px] block">Product & Brand</span>
                <span className="font-bold text-slate-900">{selectedComplaint.productName}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase text-[10px] block">Platform Order Number</span>
                <span className="font-bold text-slate-900">
                  {selectedComplaint.platform} • {selectedComplaint.orderNumber}
                </span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block mb-1">
                Citizen Grievance Statement:
              </span>
              <p className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                "{selectedComplaint.description}"
              </p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-1">
              <span className="font-bold text-blue-900 uppercase text-[10px]">AI Matched Statutory Violation:</span>
              <div className="font-semibold text-blue-800">{selectedComplaint.aiMatchedRule}</div>
              <div className="text-[11px] text-blue-700">
                NLP Sentiment Score: <strong>{Math.round(selectedComplaint.sentimentScore * 100)}% High Urgency</strong>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <Badge variant="primary" size="md">
                Status: {selectedComplaint.status}
              </Badge>
              <Button variant="primary" size="sm" onClick={() => setSelectedComplaint(null)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Grievance Submission Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Citizen Vigilance: Lodge Packaging / MRP Grievance"
        subtitle="Direct submission into the National Consumer Protection & Metrology Triage Network"
        maxWidth="2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3.5">
            <Input
              label="Consumer Full Name"
              value={newComplaintData.consumerName}
              onChange={(e) => setNewComplaintData({ ...newComplaintData, consumerName: e.target.value })}
              required
            />
            <Input
              label="Consumer Email"
              type="email"
              value={newComplaintData.consumerEmail}
              onChange={(e) => setNewComplaintData({ ...newComplaintData, consumerEmail: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <Input
              label="Product Title"
              value={newComplaintData.productName}
              onChange={(e) => setNewComplaintData({ ...newComplaintData, productName: e.target.value })}
              required
            />
            <Input
              label="Brand / Manufacturer"
              value={newComplaintData.brand}
              onChange={(e) => setNewComplaintData({ ...newComplaintData, brand: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                E-Commerce Platform
              </label>
              <select
                value={newComplaintData.platform}
                onChange={(e) =>
                  setNewComplaintData({ ...newComplaintData, platform: e.target.value as PlatformType })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option>Amazon</option>
                <option>Flipkart</option>
                <option>Blinkit</option>
                <option>Zepto</option>
                <option>Meesho</option>
                <option>Direct</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Violation Category
              </label>
              <select
                value={newComplaintData.category}
                onChange={(e) =>
                  setNewComplaintData({
                    ...newComplaintData,
                    category: e.target.value as Complaint['category'],
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option>Price Gouging / MRP Violation</option>
                <option>Misleading Ad / Claim</option>
                <option>Substandard / Expiry Issue</option>
                <option>Missing Country of Origin</option>
                <option>Dark Patterns / Fake Discount</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Grievance Description & Discrepancy Observed
            </label>
            <textarea
              rows={3}
              value={newComplaintData.description}
              onChange={(e) => setNewComplaintData({ ...newComplaintData, description: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="gap-1.5">
              <Send className="h-3.5 w-3.5" />
              <span>Submit & Auto-Triage</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
