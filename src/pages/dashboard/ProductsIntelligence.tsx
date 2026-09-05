import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Scan,
  Sparkles,
  Download,
  Plus,
  ScanLine,
} from 'lucide-react';
import { useComplianceStore } from '../../store/complianceStore';
import { Product, PlatformType, ComplianceStatus } from '../../types/compliance';
import { ProductDetailModal } from './ProductDetailModal';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { formatCurrency } from '../../lib/utils';

export const ProductsIntelligence: React.FC = () => {
  const { products, selectedProduct, setSelectedProduct, issueNotice } = useComplianceStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  const platforms = ['All', 'Amazon', 'Flipkart', 'Blinkit', 'Zepto', 'Meesho', 'Nykaa'];
  const statuses = ['All', 'compliant', 'non-compliant', 'under-review', 'notice-issued'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlatform = selectedPlatform === 'All' || p.platform === selectedPlatform;
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const handleOpenDetail = (product: Product) => {
    setActiveModalProduct(product);
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const handleIssueNotice = (productId: string) => {
    // Find matching violation or issue notice
    const violation = useComplianceStore.getState().violations.find((v) => v.productId === productId);
    if (violation) {
      issueNotice(violation.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 w-fit">
            <Scan className="h-3.5 w-3.5" />
            <span>Marketplace Catalog Optical Telemetry</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Products Compliance Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-crawled e-commerce listings paired with high-resolution OCR packaging verification.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link to="/dashboard/scanner">
            <Button variant="primary" size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
              <ScanLine className="h-3.5 w-3.5" />
              <span>Scan New Packaging (OCR)</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-6">
              <Input
                placeholder="Search SKU, Product Title, Brand, Manufacturer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                className="text-xs"
              />
            </div>

            {/* Platform Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                {platforms.map((plat) => (
                  <option key={plat} value={plat}>
                    Platform: {plat}
                  </option>
                ))}
              </select>
            </div>

            {/* Compliance Status Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none capitalize"
              >
                {statuses.map((stat) => (
                  <option key={stat} value={stat}>
                    Status: {stat.replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Package className="h-4 w-4 text-slate-700" />
            <span>Scanned Product Repository ({filteredProducts.length})</span>
          </CardTitle>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Product / SKU</th>
                <th className="px-3 py-3">Platform</th>
                <th className="px-3 py-3">Pricing (List / MRP)</th>
                <th className="px-3 py-3">OCR Match</th>
                <th className="px-3 py-3">Compliance Score</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  onClick={() => handleOpenDetail(product)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
                      />
                      <div className="max-w-xs">
                        <div className="font-semibold text-slate-900 line-clamp-1">{product.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {product.brand} • SKU: {product.sku}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-3 font-medium text-slate-700">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-200">
                      {product.platform}
                    </span>
                  </td>

                  <td className="px-3 py-3 font-mono">
                    <div className="font-semibold text-slate-900">{formatCurrency(product.listedPrice)}</div>
                    <div className="text-[11px] text-slate-400 line-through">{formatCurrency(product.mrp)}</div>
                  </td>

                  <td className="px-3 py-3 font-mono text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-700 font-semibold">{product.ocrConfidence}%</span>
                    </div>
                  </td>

                  <td className="px-3 py-3 font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-slate-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            product.complianceScore >= 80
                              ? 'bg-emerald-600'
                              : product.complianceScore >= 50
                              ? 'bg-amber-500'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${product.complianceScore}%` }}
                        />
                      </div>
                      <span className="font-bold">{product.complianceScore}</span>
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <Badge
                      variant={
                        product.status === 'compliant'
                          ? 'success'
                          : product.status === 'notice-issued'
                          ? 'danger'
                          : product.status === 'non-compliant'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {product.status.replace('-', ' ')}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600 gap-1">
                      <span>Inspect</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Product Deep Detail Modal */}
      <ProductDetailModal
        product={activeModalProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onIssueNotice={handleIssueNotice}
      />
    </div>
  );
};
