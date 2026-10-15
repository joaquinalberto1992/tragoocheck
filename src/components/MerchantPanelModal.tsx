import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Download,
  CheckCircle2,
  Building2,
  CreditCard,
  MessageCircle,
  Globe,
  Plus,
  Trash2,
  Truck,
  Search,
  Copy,
  Check,
  ExternalLink,
  Instagram,
  ClipboardList,
} from 'lucide-react';
import {
  ConfirmedOrder,
  MerchantConfigClient,
  normalizeWhatsAppPhone,
} from './CheckoutModal';
import { ALL_PRODUCTS, INSTAGRAM_URL } from '../data/products';

interface MerchantPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MerchantConfigClient;
  onConfigUpdated: (newConfig: MerchantConfigClient) => void;
  orders: ConfirmedOrder[];
  onOrdersUpdated: (newOrders: ConfirmedOrder[]) => void;
}

export const MerchantPanelModal: React.FC<MerchantPanelModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigUpdated,
  orders,
  onOrdersUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'domain' | 'bank_stripe'>('orders');

  // Order filtering & manual order creation
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pendiente_comprobante' | 'pagado' | 'enviado'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  const [newCustomerCity, setNewCustomerCity] = useState('León, Gto.');
  const [newSelectedProductId, setNewSelectedProductId] = useState(ALL_PRODUCTS[0].id);
  const [newQuantity, setNewQuantity] = useState(1);
  const [newPaymentMethod, setNewPaymentMethod] = useState<'link_pago' | 'oxxo' | 'spei'>(
    'link_pago'
  );

  // Config states
  const [bankName, setBankName] = useState(config.bankName);
  const [clabe, setClabe] = useState(config.clabe);
  const [accountHolder, setAccountHolder] = useState(config.accountHolder);
  const [whatsappNumber, setWhatsappNumber] = useState(config.whatsappNumber);
  const [instagramUrl, setInstagramUrl] = useState(
    config.instagramUrl || INSTAGRAM_URL
  );
  const [customDomain, setCustomDomain] = useState(
    config.customDomain || 'tragoocheck.shop'
  );
  const [shippingFee, setShippingFee] = useState(String(config.shippingFee || 99));
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    String(Math.max(899, config.freeShippingThreshold || 899))
  );
  const [speiDiscountPercent, setSpeiDiscountPercent] = useState(
    String(config.speiDiscountPercent || 5)
  );
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [paymentLinks, setPaymentLinks] = useState<Record<string, string>>(
    config.stripePaymentLinks || {}
  );
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedDns, setCopiedDns] = useState<string | null>(null);

  useEffect(() => {
    setBankName(config.bankName);
    setClabe(config.clabe);
    setAccountHolder(config.accountHolder);
    setWhatsappNumber(config.whatsappNumber);
    setInstagramUrl(config.instagramUrl || INSTAGRAM_URL);
    setCustomDomain(config.customDomain || 'tragoocheck.shop');
    setShippingFee(String(config.shippingFee || 99));
    setFreeShippingThreshold(
      String(Math.max(899, config.freeShippingThreshold || 899))
    );
    setSpeiDiscountPercent(String(config.speiDiscountPercent || 5));
    setPaymentLinks(config.stripePaymentLinks || {});
  }, [config]);

  useEffect(() => {
    const map: Record<string, string> = {};
    orders.forEach((o) => {
      map[o.folio] = o.trackingNumber || '';
    });
    setTrackingInputs(map);
  }, [orders]);

  if (!isOpen) return null;

  const handleCopyText = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopiedDns(key);
    setTimeout(() => setCopiedDns(null), 2000);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const cleanDomain = customDomain
        .trim()
        .replace(/^https?:\/\//i, '')
        .replace(/\/+$/, '');

      const payload: Record<string, any> = {
        bankName,
        clabe,
        accountHolder,
        whatsappNumber,
        instagramUrl: instagramUrl.trim() || INSTAGRAM_URL,
        customDomain: cleanDomain || 'tragoocheck.shop',
        shippingFee: Number(shippingFee) || 99,
        freeShippingThreshold: Math.max(899, Number(freeShippingThreshold) || 899),
        speiDiscountPercent: Number(speiDiscountPercent) || 5,
        stripePaymentLinks: paymentLinks,
      };
      if (stripeSecretKey.trim()) {
        payload.stripeSecretKeyOverride = stripeSecretKey.trim();
      }

      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const updated = await res.json();
      onConfigUpdated(updated);
      setStripeSecretKey('');
      setSaveMessage(
        'Configuración de cobros, envíos ($899 MXN) y dominio guardada correctamente.'
      );
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err) {
      setSaveMessage('Error al guardar la configuración.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (
    folio: string,
    newStatus: 'pendiente_comprobante' | 'pagado' | 'enviado'
  ) => {
    try {
      const res = await fetch(`/api/orders/${folio}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        onOrdersUpdated(orders.map((o) => (o.folio === folio ? updatedOrder : o)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTracking = async (folio: string) => {
    const trackingNumber = (trackingInputs[folio] || '').trim();
    try {
      const res = await fetch(`/api/orders/${folio}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber,
          paymentStatus: trackingNumber ? 'enviado' : undefined,
        }),
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        onOrdersUpdated(orders.map((o) => (o.folio === folio ? updatedOrder : o)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOrder = async (folio: string) => {
    try {
      const res = await fetch(`/api/orders/${folio}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onOrdersUpdated(orders.filter((o) => o.folio !== folio));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;
    const prod =
      ALL_PRODUCTS.find((p) => p.id === newSelectedProductId) || ALL_PRODUCTS[0];
    const qty = Math.max(1, Number(newQuantity) || 1);
    const subtotal = prod.price * qty;
    const shipping = subtotal >= 899 ? 0 : Number(shippingFee) || 99;
    const discount =
      newPaymentMethod === 'spei' ? Math.round(subtotal * 0.05) : 0;
    const total = subtotal - discount + shipping;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: newCustomerName.trim(),
          customerPhone: newCustomerPhone.trim(),
          customerEmail: '',
          shippingAddress: newCustomerAddress.trim() || 'Pedido por Instagram / WhatsApp',
          city: newCustomerCity.trim(),
          state: newCustomerCity.trim(),
          postalCode: '00000',
          items: [
            {
              id: prod.id,
              name: prod.name,
              price: prod.price,
              quantity: qty,
            },
          ],
          subtotal,
          discount,
          shipping,
          total,
          paymentMethod: newPaymentMethod,
          paymentStatus: 'pagado',
          transferReference: 'Venta Directa IG/WA',
        }),
      });
      if (res.ok) {
        const created = await res.json();
        onOrdersUpdated([created, ...orders]);
        setNewCustomerName('');
        setNewCustomerPhone('');
        setNewCustomerAddress('');
        setShowNewOrderForm(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Folio',
      'Fecha',
      'Cliente',
      'WhatsApp',
      'Ciudad',
      'Estado',
      'CP',
      'Direccion',
      'Metodo Pago',
      'Estatus',
      'Guia Paqueteria',
      'Total MXN',
      'Productos',
    ];
    const rows = orders.map((o) => [
      o.folio,
      new Date(o.createdAt).toLocaleString('es-MX'),
      `"${o.customerName}"`,
      o.customerPhone,
      `"${o.city}"`,
      `"${o.state}"`,
      o.postalCode,
      `"${o.shippingAddress}"`,
      o.paymentMethod.toUpperCase(),
      o.paymentStatus,
      `"${o.trackingNumber || ''}"`,
      o.total,
      `"${o.items.map((i) => `${i.quantity}x ${i.name}`).join(' + ')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `pedidos-tragoo-check-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'pagado' || o.paymentStatus === 'enviado')
    .reduce((acc, o) => acc + o.total, 0);

  const pendingSpeiCount = orders.filter(
    (o) => o.paymentStatus === 'pendiente_comprobante'
  ).length;
  const readyToShipCount = orders.filter((o) => o.paymentStatus === 'pagado').length;
  const shippedCount = orders.filter((o) => o.paymentStatus === 'enviado').length;

  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      statusFilter === 'all' ? true : o.paymentStatus === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      o.folio.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.city.toLowerCase().includes(q) ||
      o.customerPhone.includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4">
      <div className="w-full max-w-5xl bg-[#0F0C16] border border-[#262136] rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#231E30] bg-[#14111D]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#A3E635]/15 border border-[#A3E635]/40 flex items-center justify-center text-[#A3E635]">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Panel de Control Tragoo Check · Pedidos, Dominio y Cobros
              </h2>
              <p className="text-xs text-[#A19BB2]">
                Administra pedidos SPEI/Stripe, asigna guías de envío y conecta tu dominio propio
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#A19BB2] hover:text-white hover:bg-[#1E192B] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-[#110E19] border-b border-[#231E30]">
          <div className="inline-flex flex-wrap p-1 bg-[#181424] border border-[#262136] rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'orders'
                  ? 'bg-[#A3E635] text-[#0B0910] font-bold'
                  : 'text-[#C4BED4] hover:text-white'
              }`}
            >
              1. Panel de Pedidos ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('domain')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'domain'
                  ? 'bg-[#A3E635] text-[#0B0910] font-bold'
                  : 'text-[#C4BED4] hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>2. Conectar Mi Dominio ({customDomain})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bank_stripe')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'bank_stripe'
                  ? 'bg-[#A3E635] text-[#0B0910] font-bold'
                  : 'text-[#C4BED4] hover:text-white'
              }`}
            >
              3. Cuenta SPEI, Stripe y Redes
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#A19BB2]">
              Ingresos confirmados:{' '}
              <strong className="font-mono text-[#A3E635]">
                ${totalRevenue.toLocaleString('es-MX')} MXN
              </strong>
            </span>
            {activeTab === 'orders' && orders.length > 0 && (
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2E2840] text-[#C4BED4] hover:text-white transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar Excel/CSV
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'orders' ? (
            <div className="space-y-5">
              {/* 4 KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#14111D] border border-[#262136]">
                  <div className="text-[11px] text-[#A19BB2]">Total de Pedidos</div>
                  <div className="font-mono text-xl font-extrabold text-white mt-0.5">
                    {orders.length}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#14111D] border border-[#262136]">
                  <div className="text-[11px] text-[#A19BB2]">Pendientes SPEI</div>
                  <div className="font-mono text-xl font-extrabold text-amber-400 mt-0.5">
                    {pendingSpeiCount}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#14111D] border border-[#262136]">
                  <div className="text-[11px] text-[#A19BB2]">Pagados (Por enviar)</div>
                  <div className="font-mono text-xl font-extrabold text-[#A3E635] mt-0.5">
                    {readyToShipCount}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#14111D] border border-[#262136]">
                  <div className="text-[11px] text-[#A19BB2]">Enviados con Guía</div>
                  <div className="font-mono text-xl font-extrabold text-purple-400 mt-0.5">
                    {shippedCount}
                  </div>
                </div>
              </div>

              {/* Filter Bar + Search + Manual Order Button */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: `Todos (${orders.length})` },
                    {
                      id: 'pendiente_comprobante',
                      label: `Pendientes SPEI (${pendingSpeiCount})`,
                    },
                    { id: 'pagado', label: `Pagados (${readyToShipCount})` },
                    { id: 'enviado', label: `Enviados (${shippedCount})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setStatusFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        statusFilter === tab.id
                          ? 'bg-white text-[#0B0910] border-white font-bold'
                          : 'bg-[#14111D] text-[#C4BED4] border-[#262136] hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-56">
                    <Search className="w-3.5 h-3.5 text-[#8E87A0] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar folio, cliente, ciudad..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#14111D] border border-[#2E2840] text-xs text-white focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewOrderForm(!showNewOrderForm)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#A3E635] hover:bg-[#BEF264] text-[#0B0910] font-bold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Registrar Pedido IG/WA</span>
                  </button>
                </div>
              </div>

              {/* Manual Order Creation Form (for Instagram @tragoocheck or WhatsApp DM sales) */}
              {showNewOrderForm && (
                <form
                  onSubmit={handleCreateManualOrder}
                  className="p-4 rounded-xl bg-[#14111D] border border-[#A3E635]/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#A3E635]">
                      Registrar venta cerrada por Instagram (@tragoocheck) o WhatsApp
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowNewOrderForm(false)}
                      className="text-xs text-[#A19BB2] hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      placeholder="Nombre del cliente o bar"
                      className="px-3 py-2 rounded-lg bg-[#0B0910] border border-[#2E2840] text-xs text-white"
                    />
                    <input
                      type="text"
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      placeholder="WhatsApp (10 dígitos)"
                      className="px-3 py-2 rounded-lg bg-[#0B0910] border border-[#2E2840] text-xs text-white font-mono"
                    />
                    <input
                      type="text"
                      value={newCustomerCity}
                      onChange={(e) => setNewCustomerCity(e.target.value)}
                      placeholder="Ciudad / Estado"
                      className="px-3 py-2 rounded-lg bg-[#0B0910] border border-[#2E2840] text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <select
                      value={newSelectedProductId}
                      onChange={(e) => setNewSelectedProductId(e.target.value)}
                      className="sm:col-span-2 px-3 py-2 rounded-lg bg-[#0B0910] border border-[#2E2840] text-xs text-white"
                    >
                      {ALL_PRODUCTS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (${p.price} MXN)
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(Number(e.target.value))}
                      placeholder="Cantidad"
                      className="px-3 py-2 rounded-lg bg-[#0B0910] border border-[#2E2840] text-xs text-white font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-[#A3E635] text-[#0B0910] font-bold text-xs cursor-pointer"
                    >
                      Guardar Pedido
                    </button>
                  </div>
                </form>
              )}

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-sm text-[#A19BB2]">
                  No se encontraron pedidos con este filtro.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.folio}
                      className="p-4 rounded-xl bg-[#14111D] border border-[#262136] space-y-3"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-mono font-bold text-[#A3E635]">
                              {order.folio}
                            </span>
                            <span aria-hidden="true" className="text-[#524A68]">
                              ·
                            </span>
                            <span className="font-bold text-white">
                              {order.customerName}
                            </span>
                            <span aria-hidden="true" className="text-[#524A68]">
                              ·
                            </span>
                            <span className="text-[#A19BB2]">
                              {order.paymentMethod === 'oxxo'
                                ? 'Pago en OXXO (WhatsApp)'
                                : order.paymentMethod === 'spei'
                                ? 'Transferencia SPEI'
                                : 'Link de Pago (WhatsApp)'}
                            </span>
                            <span aria-hidden="true" className="text-[#524A68]">
                              ·
                            </span>
                            <span className="font-mono font-extrabold text-white">
                              ${order.total.toLocaleString('es-MX')} MXN
                            </span>
                            <span className="text-[11px] text-[#8E87A0]">
                              (
                              {order.shipping === 0
                                ? 'Envío Gratis ≥$899'
                                : `Envío pagado $${order.shipping}`}
                              )
                            </span>
                          </div>

                          <div className="text-xs text-[#C4BED4] font-medium">
                            {order.items
                              .map((i) => `${i.quantity}x ${i.name}`)
                              .join(' + ')}
                          </div>

                          <div className="text-[11px] text-[#A19BB2]">
                            Dirección: {order.shippingAddress}, {order.city},{' '}
                            {order.state}, CP {order.postalCode} · WhatsApp:{' '}
                            <strong className="text-white">{order.customerPhone}</strong>
                            {order.transferReference
                              ? ` · Pago: ${order.transferReference}`
                              : ''}
                          </div>
                        </div>

                        {/* Status + WhatsApp + Delete Controls */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <select
                            value={order.paymentStatus}
                            onChange={(e) =>
                              handleStatusChange(order.folio, e.target.value as any)
                            }
                            className="px-3 py-1.5 rounded-lg bg-[#0B0910] border border-[#2E2840] text-xs text-white focus:outline-none focus:border-[#A3E635]"
                          >
                            <option value="pendiente_comprobante">
                              Pendiente pago (Link / OXXO / SPEI)
                            </option>
                            <option value="pagado">Pagado (Preparando)</option>
                            <option value="enviado">Enviado con Guía</option>
                          </select>

                          <a
                            href={`https://wa.me/${normalizeWhatsAppPhone(
                              order.customerPhone
                            )}?text=${encodeURIComponent(
                              `Hola ${order.customerName}! Te escribimos de Tragoo Check respecto a tu pedido *${order.folio}* (${order.items
                                .map((i) => `${i.quantity}x ${i.name}`)
                                .join(', ')}).${
                                trackingInputs[order.folio]
                                  ? ` Tu guía de rastreo express es: *${trackingInputs[order.folio]}*`
                                  : ' Aquí te compartimos tu link de pago / ficha OXXO para confirmar tu envío:'
                              }`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A3E635] hover:bg-[#BEF264] text-[#0B0910] text-xs font-bold transition-colors whitespace-nowrap shrink-0"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Enviar Link / Avisar por WhatsApp
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order.folio)}
                            className="p-1.5 rounded-lg text-[#8E87A0] hover:text-red-400 hover:bg-[#1E192B] transition-colors cursor-pointer"
                            title="Eliminar pedido"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Shipping Tracking Number Bar */}
                      <div className="pt-2.5 border-t border-[#231E30] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-[11px] text-[#A19BB2]">
                          <Truck className="w-3.5 h-3.5 text-[#A3E635] shrink-0" />
                          <span>Guía de paquetería (DHL / Estafeta / FedEx / 99Minutos):</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={trackingInputs[order.folio] || ''}
                            onChange={(e) =>
                              setTrackingInputs({
                                ...trackingInputs,
                                [order.folio]: e.target.value,
                              })
                            }
                            placeholder="Ej. DHL-994810234"
                            className="px-3 py-1 rounded-lg bg-[#0B0910] border border-[#2E2840] font-mono text-xs text-white focus:outline-none focus:border-[#A3E635]"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveTracking(order.folio)}
                            className="px-3 py-1 rounded-lg bg-[#1E192B] hover:bg-[#A3E635] text-white hover:text-[#0B0910] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Guardar guía y marcar Enviado
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'domain' ? (
            /* TAB 2: CUSTOM DOMAIN INTEGRATION */
            <form onSubmit={handleSaveConfig} className="space-y-6">
              <div className="p-5 rounded-xl bg-[#14111D] border border-[#262136] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Globe className="w-4 h-4 text-[#A3E635]" />
                    <span>Conectar tu Dominio Propio a Tragoo Check</span>
                  </div>
                  <span className="font-mono text-xs text-[#A3E635]">
                    Activo: https://{customDomain || 'tragoocheck.shop'}
                  </span>
                </div>

                <p className="text-xs text-[#C4BED4] leading-relaxed">
                  Escribe aquí el dominio que compraste (por ejemplo{' '}
                  <strong className="text-white">tragoocheck.shop</strong>,{' '}
                  <strong className="text-white">tragoocheck.com</strong> o{' '}
                  <strong className="text-white">tragoocheck.mx</strong>). El
                  servidor ya quedó configurado para usar tu dominio en los
                  retornos automáticos de <strong className="text-white">Stripe Checkout</strong>,
                  enlaces de compartición y PWA.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-[#A19BB2] mb-1">
                      Tu Dominio Oficial (sin https://)
                    </label>
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="tragoocheck.shop"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0910] border border-[#2E2840] font-mono text-xs text-white focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="py-2.5 px-4 rounded-lg bg-[#A3E635] hover:bg-[#BEF264] text-[#0B0910] font-bold text-xs transition-colors cursor-pointer"
                  >
                    {isSaving ? 'Vinculando...' : 'Vincular Dominio'}
                  </button>
                </div>
              </div>

              {/* Step-by-Step DNS Guide for User's Registrar */}
              <div className="p-5 rounded-xl bg-[#14111D] border border-[#262136] space-y-4">
                <h3 className="text-sm font-bold text-white">
                  Registros DNS para apuntar tu dominio (GoDaddy, Hostinger, Namecheap o Cloudflare)
                </h3>
                <p className="text-xs text-[#C4BED4] leading-relaxed">
                  Como el panel de tu proveedor de dominio requiere tu contraseña personal, copia estos 2 registros en la sección <strong className="text-white">Zona DNS / Administrar DNS</strong> de tu dominio para que abra esta tienda directamente con certificado SSL automático:
                </p>

                <div className="space-y-2.5 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-[#0B0910] border border-[#231E30] flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[#A3E635] font-bold">TIPO A</span> · Host:{' '}
                      <strong className="text-white">@</strong> · Apunta a:{' '}
                      <strong className="text-white">216.239.32.21</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText('216.239.32.21', 'a1')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1E192B] text-white text-[11px] cursor-pointer"
                    >
                      {copiedDns === 'a1' ? (
                        <>
                          <Check className="w-3 h-3 text-[#A3E635]" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copiar IP
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0B0910] border border-[#231E30] flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[#A3E635] font-bold">TIPO CNAME</span> · Host:{' '}
                      <strong className="text-white">www</strong> · Apunta a:{' '}
                      <strong className="text-white">ghs.googlehosted.com</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText('ghs.googlehosted.com', 'cname')
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1E192B] text-white text-[11px] cursor-pointer"
                    >
                      {copiedDns === 'cname' ? (
                        <>
                          <Check className="w-3 h-3 text-[#A3E635]" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copiar CNAME
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-[#A19BB2] leading-relaxed">
                  Nota: También puedes usar redirección directa con enmascaramiento desde tu proveedor hacia la URL pública de tu tienda o mapearlo en Cloud Run → Custom Domains.
                </div>
              </div>

              {saveMessage && (
                <div className="p-3 rounded-lg bg-[#172312] border border-[#A3E635]/40 text-xs text-[#A3E635] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saveMessage}</span>
                </div>
              )}
            </form>
          ) : (
            /* TAB 3: SPEI, STRIPE, SHIPPING ($899 MIN) & INSTAGRAM */
            <form onSubmit={handleSaveConfig} className="space-y-6">
              {/* SPEI & Shipping Rules */}
              <div className="p-5 rounded-xl bg-[#14111D] border border-[#262136] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Building2 className="w-4 h-4 text-[#A3E635]" />
                  <span>Datos Bancarios SPEI, Regla de Envíos ($899 MXN) e Instagram</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#A19BB2] mb-1">
                      Banco receptor (Ej. BBVA, Nu, STP, Banorte)
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-[#0B0910] border border-[#2E2840] text-xs text-white focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#A19BB2] mb-1">
                      CLABE Interbancaria (18 dígitos)
                    </label>
                    <input
                      type="text"
                      maxLength={18}
                      value={clabe}
                      onChange={(e) => setClabe(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2 rounded-lg bg-[#0B0910] border border-[#2E2840] font-mono text-xs text-white focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#A19BB2] mb-1">
                      Nombre del Titular / Beneficiario
                    </label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-[#0B0910] border border-[#2E2840] text-xs text-white focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#A19BB2] mb-1">
                      WhatsApp de Ventas (con lada 521)
                    </label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) =>
                        setWhatsappNumber(e.target.value.replace(/\D/g, ''))
                      }
                      placeholder="5215512345678"
                      className="w-full px-3.5 py-2 rounded-lg bg-[#0B0910] border border-[#2E2840] font-mono text-xs text-white focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs text-[#A19BB2] mb-1">
                      Costo Envío (1 pza o &lt; $899 MXN)
                    </label>
                    <input
                      type="number"
                      value={shippingFee}
                      onChange={(e) => setShippingFee(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-[#0B0910] border border-[#2E2840] font-mono text-xs text-white focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#A19BB2] mb-1">
                      Envío Gratis a partir de ($ MXN, mín 899)
                    </label>
                    <input
                      type="number"
                      min={899}
                      value={freeShippingThreshold}
                      onChange={(e) => setFreeShippingThreshold(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-[#0B0910] border border-[#2E2840] font-mono text-xs text-white focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#A19BB2] mb-1">
                      Descuento por pago SPEI (%)
                    </label>
                    <input
                      type="number"
                      value={speiDiscountPercent}
                      onChange={(e) => setSpeiDiscountPercent(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-[#0B0910] border border-[#2E2840] font-mono text-xs text-white focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#A19BB2] mb-1">
                    Instagram Oficial
                  </label>
                  <input
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#0B0910] border border-[#2E2840] font-mono text-xs text-white focus:outline-none focus:border-[#A3E635]"
                  />
                </div>
              </div>

              {/* Stripe Configuration Section */}
              <div className="p-5 rounded-xl bg-[#14111D] border border-[#262136] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <CreditCard className="w-4 h-4 text-[#A3E635]" />
                    <span>Integración con Stripe (Checkout Automático o Links de Pago)</span>
                  </div>
                  <span className="text-xs text-[#A3E635]">
                    {config.hasLiveStripeKey
                      ? 'Stripe API Conectada'
                      : 'Pasarela integrada activa'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs text-[#A19BB2] mb-1">
                    Clave Secreta de Stripe (`sk_live_...` o `sk_test_...`)
                  </label>
                  <input
                    type="password"
                    value={stripeSecretKey}
                    onChange={(e) => setStripeSecretKey(e.target.value)}
                    placeholder={
                      config.hasLiveStripeKey
                        ? 'Clave sk_... ya configurada (escribe para reemplazar)'
                        : 'Pega aquí tu sk_live_... o sk_test_... para redirigir a Stripe Checkout oficial'
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-[#0B0910] border border-[#2E2840] font-mono text-xs text-white focus:outline-none focus:border-[#A3E635]"
                  />
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="text-xs font-medium text-white">
                    O pega tus Links de Pago directo de Stripe (`https://buy.stripe.com/...`) por producto:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ALL_PRODUCTS.map((prod) => (
                      <div key={prod.id}>
                        <label className="block text-[11px] text-[#A19BB2] mb-1">
                          {prod.name} (${prod.price.toLocaleString('es-MX')} MXN)
                        </label>
                        <input
                          type="url"
                          value={paymentLinks[prod.id] || ''}
                          onChange={(e) =>
                            setPaymentLinks({
                              ...paymentLinks,
                              [prod.id]: e.target.value,
                            })
                          }
                          placeholder="https://buy.stripe.com/..."
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0B0910] border border-[#2E2840] font-mono text-xs text-white focus:outline-none focus:border-[#A3E635]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {saveMessage && (
                <div className="p-3 rounded-lg bg-[#172312] border border-[#A3E635]/40 text-xs text-[#A3E635] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saveMessage}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#A3E635] hover:bg-[#BEF264] text-[#0B0910] font-bold text-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Guardando cambios...' : 'Guardar Configuración'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
