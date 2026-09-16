import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useComplianceStore } from '../store/complianceStore';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { Product, SupportedLanguage } from '../types/compliance';
import { CitizenProductCard } from '../components/citizen/CitizenProductCard';
import { CitizenProductModal } from '../components/citizen/CitizenProductModal';
import { CitizenAuthModal } from '../components/citizen/CitizenAuthModal';
import { PublicComplaintModal } from '../components/citizen/PublicComplaintModal';
import { LandingNavbar } from '../components/layout/LandingNavbar';
import { LandingFooter } from '../components/layout/LandingFooter';

import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Search,
  ShieldCheck,
  ArrowRight,
  Languages,
} from 'lucide-react';

export const PublicDirectoryPage: React.FC = () => {
  const { products } = useComplianceStore();
  const { isAuthenticated, user } = useAuthStore();
  const { language, setLanguage, t } = useLanguageStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDietary, setSelectedDietary] = useState<string>('All');

  // Modals
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [pendingComplaintProduct, setPendingComplaintProduct] = useState<Product | null>(null);

  const categories = [
    'All',
    'Nutritional Drinks & Packaged Foods',
    'Beverages & Packaged Foods',
    'Personal Care & Cosmetics',
    'Personal Care & Soaps',
    'Hair Care & Cosmetics',
    'Edible Oils & Hair Care',
    'Edible Oils & Cooking Essentials',
    'Packaged Tea & Beverages',
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
    if (!isAuthenticated || user?.role !== 'consumer') {
      navigate('/login?portal=consumer');
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
      <LandingNavbar />

      {/* Main Public Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Language Selector Toolbar */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Languages className="h-4 w-4 text-blue-600" />
            <span>{t('selectLanguage')}:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिन्दी' },
              { code: 'kn', label: 'ಕನ್ನಡ' },
              { code: 'ta', label: 'தமிழ்' },
            ].map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code as SupportedLanguage)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  language === lang.code
                    ? 'bg-blue-600 text-white shadow-sm font-bold ring-2 ring-blue-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters Strip */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-6">
              <Input
                placeholder={t('searchDirectoryPlaceholder')}
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
                    {cat === 'All' ? t('allCategories') : cat}
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
                <option value="All">{t('allDietary')}</option>
                <option value="Vegetarian">Vegetarian (Green Dot)</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
              </select>
            </div>
          </div>

          {/* Quick Active Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">{t('displayingRecords')}:</span>
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
              <span>Mandatory Statutory Packaging Standards (Legal Metrology Rules, 2011)</span>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              Every packaged commodity sold in India or on e-commerce marketplaces must clearly display MRP (inclusive of all taxes), Unit Sale Price, Name & Address of Manufacturer/Packer, Net Quantity, Country of Origin, Customer Care contact, and FSSAI License where applicable.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link to="/login?portal=consumer">
              <Button variant="primary" size="md" className="gap-2 text-xs shadow-xs">
                <span>Customer Portal Login</span>
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


    </div>
  );
};
