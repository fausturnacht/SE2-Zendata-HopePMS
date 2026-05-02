import { useState, useEffect, useMemo } from 'react';
import { getProductListing } from '../../api/reports';
import { useRights } from '../../hooks/useRights';
import { Search, ChevronLeft, ChevronRight, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ITEMS_PER_PAGE = 10;

export default function FullProductListingReport() {
  const { userRole, hasRight } = useRights();
  const [products, setProducts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await getProductListing(userRole);
        setProducts(data);
      } catch (err) {
        console.error('Error fetching reports data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [userRole]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (filterCategory !== 'All') {
      const lowerFilter = filterCategory.toLowerCase();
      // Heuristic string match for category if product structure has no exact "category" field
      filtered = filtered.filter(p => (p.description || '').toLowerCase().includes(lowerFilter) || (p.prodcode || '').toLowerCase().includes(lowerFilter));
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        p =>
          (p.prodcode || '').toLowerCase().includes(searchLower) ||
          (p.description || '').toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  }, [searchTerm, products, filterCategory]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleExportCSV = () => {
    const headers = ['Product Code', 'Description', 'Unit', 'Current Price'];
    if (hasRight('STAMP')) headers.push('Stamp');

    const csvRows = [
      headers.join(','),
      ...filteredProducts.map(p => {
        const cols = [
          p.prodcode,
          `"${(p.description || '').replace(/"/g, '""')}"`,
          p.unit || '',
          p.current_price?.toFixed(2) || '0.00',
        ];
        if (hasRight('STAMP')) cols.push(!p.stamp || p.stamp === 'VERIFIED' || p.stamp === 'V' ? 'Verified' : p.stamp);
        return cols.join(',');
      })
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Full_Product_Listing_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toISOString().split('T')[0];

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('HOPE PMS', 14, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Research Logistics', 14, 25);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    // Center Title "Full Product Listing"
    const titleWidth = doc.getStringUnitWidth('Full Product Listing') * 14 / doc.internal.scaleFactor;
    const pageWidth = doc.internal.pageSize.width;
    doc.text('Full Product Listing', (pageWidth - titleWidth) / 2, 20);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${dateStr}`, pageWidth - 14, 20, { align: 'right' });

    doc.setLineWidth(0.5);
    doc.line(14, 28, pageWidth - 14, 28);

    const head = [['Product Code', 'Description', 'Unit', 'Current Price']];
    if (hasRight('STAMP')) head[0].push('Stamp');

    const body = filteredProducts.map(p => {
      const row = [
        p.prodcode,
        p.description || '',
        p.unit || '',
        `$${(p.current_price || 0).toFixed(2)}`
      ];
      if (hasRight('STAMP')) row.push(!p.stamp || p.stamp === 'VERIFIED' || p.stamp === 'V' ? 'Verified' : p.stamp);
      return row;
    });

    autoTable(doc, {
      startY: 32,
      head: head,
      body: body,
      theme: 'plain',
      headStyles: { fontStyle: 'bold', textColor: '#2a3439' },
      bodyStyles: { textColor: '#566166' },
      didDrawPage: () => {
        // Footer
        const str = `Page ${doc.getNumberOfPages()}`;
        doc.setFontSize(8);
        const yPos = doc.internal.pageSize.height - 10;
        doc.text('HOPE INC.', 14, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text('CONFIDENTIAL', pageWidth / 2, yPos, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.text(str, pageWidth - 14, yPos, { align: 'right' });
        doc.line(14, yPos - 3, pageWidth - 14, yPos - 3);
      }
    });

    doc.save(`Full_Product_Listing_${dateStr}.pdf`);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading Report...</div>;
  }

  return (
    <div className="bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/15 flex flex-col overflow-hidden w-full">
      <div className="p-4 bg-surface-container-low flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-surface-variant">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Product Code or Description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-outline-variant/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary text-sm bg-white"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide shrink-0">
          {['All', 'Reagents', 'Consumables', 'Equipment'].map(cat => (
            <button
              key={cat}
              onClick={() => { setFilterCategory(cat); setCurrentPage(1); }}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-colors ${
                filterCategory === cat 
                  ? 'bg-secondary-container text-on-secondary-container border-transparent' 
                  : 'bg-surface text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-low'
              }`}
            >
              {cat === 'All' ? 'All Items' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto w-full sm:w-auto mt-2 sm:mt-0">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-outline-variant/30 rounded-md hover:bg-surface-container-low">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary-dim">
            <FileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-lowest border-b border-surface-container-high text-xs tracking-wider uppercase text-on-surface-variant font-semibold">
              <th className="p-4 pl-6 font-medium">Product Code</th>
              <th className="p-4 font-medium">Description</th>
              <th className="p-4 font-medium">Unit</th>
              <th className="p-4 font-medium text-right">Current Price</th>
              {hasRight('STAMP') && <th className="p-4 pr-6 text-center">Stamp</th>}
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-surface-container-high/50">
            {currentProducts.length === 0 ? (
              <tr>
                <td colSpan={hasRight('STAMP') ? 5 : 4} className="p-8 text-center text-on-surface-variant">
                  No products found.
                </td>
              </tr>
            ) : (
              currentProducts.map(product => (
                <tr key={product.prodcode} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="p-4 pl-6 font-medium text-primary">{product.prodcode}</td>
                  <td className="p-4 text-on-surface-variant">{product.description || '—'}</td>
                  <td className="p-4 text-on-surface-variant whitespace-nowrap">{product.unit || '—'}</td>
                  <td className="p-4 text-on-surface font-medium text-right whitespace-nowrap py-4">
                    ${(product.current_price || 0).toFixed(2)}
                  </td>
                  {hasRight('STAMP') && (
                    <td className="p-4 pr-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${!product.stamp || product.stamp === 'VERIFIED' || product.stamp === 'V' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {!product.stamp || product.stamp === 'VERIFIED' || product.stamp === 'V' ? 'Verified' : product.stamp}
                      </span>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredProducts.length > 0 && (
        <div className="p-4 border-t border-surface-container-high bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
          <span className="text-sm text-on-surface-variant font-medium">
            Showing <span className="font-bold text-on-surface">{startIndex + 1}</span> to <span className="font-bold text-on-surface">{Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)}</span> of <span className="font-bold text-on-surface">{filteredProducts.length}</span> entries
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 text-on-surface-variant hover:bg-surface-container-low rounded-md disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-md text-sm font-medium">
              {currentPage}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 text-on-surface-variant hover:bg-surface-container-low rounded-md disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
