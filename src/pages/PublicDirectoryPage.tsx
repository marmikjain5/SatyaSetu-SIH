import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useComplianceStore } from '../store/complianceStore';
import { useAuthStore } from '../store/authStore';
import { Product } from '../types/compliance';
import { CitizenProductCard } from '../components/citizen/CitizenProductCard';
import { CitizenProductModal } from '../components/citizen/CitizenProductModal';
import { CitizenAuthModal } from '../components/citizen/CitizenAuthModal';
import { PublicComplaintModal } from '../components/citizen/PublicComplaintModal';
import { LandingNavbar } from '../components/layout/LandingNavbar';
import { LandingFooter } from '../components/layout/LandingFooter';
import { RequestDemoModal } from '../components/landing/RequestDemoModal';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Search,
  ShieldCheck,
  Building2,
  Filter,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Terminal,
  Activity,
  Layers,
} from 'lucide-react';

export const PublicDirectoryPage: React.FC = () => {
  const { products } = useComplianceStore();
  const { isAuthenticated, user } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDietary, setSelectedDietary] = useState<string>('All');

  // Modals
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [pendingComplaintProduct, setPendingComplaintProduct] = useState<Product | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const categories = [
    'All',
    'Nutritional Supplements & Health Foods',
    'Edible Oils & FMCG Groceries',
    'Cosmetics & Personal Care',
    'Baby Care & Hygiene',
    'Consumer Electronics & Peripherals',
    'Fitness & Apparel',
  ];

  const filteredProducts = products.filter((product) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      product.title.toLowerCase().includes(q) ||
      product.brand.toLowerCase().includes(q) ||
      product.manufacturer.toLowerCase().includes(q) ||
      (product.fssaiLicenseNumber && product.fssaiLicenseNumber.toLowerCase().includes(q)) ||
      (product.ingredientsList && product.ingredientsList.some((ing) => ing.toLowerCase().includes(q)));

    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesDietary =
      selectedDietary === 'All' ||
      (selectedDietary === 'Vegetarian' && product.dietaryType === 'Vegetarian') ||
      (selectedDietary === 'Non-Vegetarian' && product.dietaryType === 'Non-Vegetarian');

    return matchesQuery && matchesCategory && matchesDietary;
  });

  const handleViewDetails = (product: Product) => {
    setSelectedProductForModal(product);
    setIsDetailModalOpen(true);
  };

  const handleReportDiscrepancy = (product: Product) => {
    setPendingComplaintProduct(product);
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      setIsComplaintModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsComplaintModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Navbar */}
      <LandingNavbar onRequestDemo={() => setIsDemoModalOpen(true)} />

      {/* Main Public Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Hero Header */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-8 sm:p-12 text-white overflow-hidden shadow-card border border-slate-800">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-mono">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>Public Citizen Transparency Hub • No Login Required</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
              Statutory Product Declarations & FSSAI Registry
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Direct access to manufacturer declarations, certified ingredient lists, standardized nutritional tables, statutory MRP, and verified FSSAI licenses under the Legal Metrology (Packaged Commodities) Rules 2011.
            </p>

            {/* Quick Metrics */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-300 font-mono">
              <div>
                <span className="text-white font-bold text-base block">{products.length} Products</span>
                <span className="text-slate-400 text-[11px]">Monitored Repository</span>
              </div>
              <div className="h-8 w-px bg-slate-700 hidden sm:block" />
              <div>
                <span className="text-emerald-400 font-bold text-base block">100% Free Access</span>
                <span className="text-slate-400 text-[11px]">Open Citizen Transparency</span>
              </div>
              <div className="h-8 w-px bg-slate-700 hidden sm:block" />
              <div>
                <span className="text-blue-400 font-bold text-base block">NCH 1915 Bridge</span>
                <span className="text-slate-400 text-[11px]">Direct Grievance Intake</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters Strip */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-6">
              <Input
                placeholder="Search Product Name, Brand, Ingredient (e.g. Whey, Mustard), or FSSAI License..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4 text-slate-400" />}
                className="text-xs"
              />
            </div>

            {/* Category Filter */}
            <div className="md:col-span-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Dietary Type Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedDietary}
                onChange={(e) => setSelectedDietary(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="All">All Types</option>
                <option value="Vegetarian">Vegetarian (Green Dot)</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
              </select>
            </div>
          </div>

          {/* Quick Active Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Displaying:</span>
              <Badge variant="secondary" size="sm" className="font-mono">
                {filteredProducts.length} Verified Records
              </Badge>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-blue-600 hover:text-blue-800 text-[11px] underline font-medium"
                >
                  Clear search
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-400">
              Citizens only need to authenticate if filing a formal statutory grievance.
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <CitizenProductCard
                key={product.id}
                product={product}
                onViewDetails={handleViewDetails}
                onReportDiscrepancy={handleReportDiscrepancy}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Search className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">No products matching your query</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try adjusting your search terms, removing filters, or searching by generic brand name or FSSAI number.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedDietary('All');
              }}
            >
              Reset All Filters
            </Button>
          </div>
        )}

        {/* Citizen Rights & Metrology Callout Banner */}
        <div className="rounded-2xl bg-blue-50 border border-blue-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <span>Know Your Consumer Rights (Consumer Protection Act 2019)</span>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              Every packaged commodity sold in India or on e-commerce marketplaces must clearly display MRP (inclusive of all taxes), Unit Sale Price, Name & Address of Manufacturer/Packer, Net Quantity, Country of Origin, Customer Care contact, and FSSAI License where applicable.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link to="/login?role=consumer">
              <Button variant="primary" size="md" className="gap-2 text-xs shadow-xs">
                <span>Citizen Portal Login</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Detailed Inspection Modal */}
      <CitizenProductModal
        product={selectedProductForModal}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onReportDiscrepancy={handleReportDiscrepancy}
      />

      {/* Citizen Quick Auth Gate Modal */}
      <CitizenAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Pre-filled Grievance Complaint Modal */}
      <PublicComplaintModal
        product={pendingComplaintProduct}
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
      />

      {/* Demo Modal */}
      <RequestDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
};
