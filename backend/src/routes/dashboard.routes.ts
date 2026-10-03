import { Router, Request, Response } from 'express';
import { MOCK_SUPPLIERS, MOCK_WAREHOUSES, MOCK_SHIPMENTS, MOCK_DISRUPTIONS } from '../data/mock-data.js';

const router = Router();

let disruptions = [...MOCK_DISRUPTIONS];

/**
 * GET /api/v1/dashboard/summary
 */
router.get('/summary', (req: Request, res: Response) => {
  // Compute real aggregated KPIs
  const totalOtif = +(MOCK_SUPPLIERS.reduce((acc, s) => acc + s.otifRate, 0) / MOCK_SUPPLIERS.length).toFixed(1);
  const avgLeadTime = +(MOCK_SUPPLIERS.reduce((acc, s) => acc + s.avgLeadTimeDays, 0) / MOCK_SUPPLIERS.length).toFixed(1);
  const stockoutRiskCount = MOCK_WAREHOUSES.filter(w => w.stockoutRisk === 'CRITICAL' || w.stockoutRisk === 'WARNING').length;
  const healthySuppliersPct = Math.round((MOCK_SUPPLIERS.filter(s => s.status === 'ACTIVE').length / MOCK_SUPPLIERS.length) * 100);

  const kpis = [
    {
      id: 'kpi_otif',
      label: 'Global OTIF Adherence',
      value: `${totalOtif}%`,
      unit: '',
      trend: { direction: 'up', percentage: 2.1 },
      severity: totalOtif >= 90 ? 'normal' : 'warning',
      subtext: 'vs 92.1% last week'
    },
    {
      id: 'kpi_leadtime',
      label: 'Average Lead Time',
      value: `${avgLeadTime}`,
      unit: 'days',
      trend: { direction: 'down', percentage: 1.2 },
      severity: 'normal',
      subtext: '-1.2 days vs monthly benchmark'
    },
    {
      id: 'kpi_stockout',
      label: 'Stockout Risk Exposure',
      value: `${stockoutRiskCount}`,
      unit: 'hubs',
      trend: { direction: 'up', percentage: 15.0 },
      severity: 'critical',
      subtext: 'Singapore Hub safety buffer < 12d'
    },
    {
      id: 'kpi_supplier_health',
      label: 'Supplier Health Index',
      value: `${healthySuppliersPct}%`,
      unit: '',
      trend: { direction: 'up', percentage: 5.0 },
      severity: 'normal',
      subtext: '5 of 7 Tier-1 vendors healthy'
    }
  ];

  // Supply chain performance trend data for chart
  const historicalTrends = [
    { period: 'Week 36', otif: 91.2, leadTime: 16.4, costIndex: 102 },
    { period: 'Week 37', otif: 92.5, leadTime: 15.8, costIndex: 101 },
    { period: 'Week 38', otif: 93.1, leadTime: 15.0, costIndex: 99 },
    { period: 'Week 39', otif: 94.2, leadTime: 14.5, costIndex: 98 },
    { period: 'Week 40', otif: totalOtif, leadTime: avgLeadTime, costIndex: 97 }
  ];

  return res.json({
    kpis,
    historicalTrends,
    alerts: disruptions.filter(d => d.status !== 'RESOLVED'),
    totalShipmentsInTransit: MOCK_SHIPMENTS.filter(s => s.status === 'IN_TRANSIT' || s.status === 'DELAYED').length,
    delayedShipmentsCount: MOCK_SHIPMENTS.filter(s => s.status === 'DELAYED').length,
    lastRefreshedAt: new Date().toISOString()
  });
});

/**
 * POST /api/v1/dashboard/alerts/:id/acknowledge
 */
router.post('/alerts/:id/acknowledge', (req: Request, res: Response) => {
  const alert = disruptions.find(d => d.id === req.params.id);
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  alert.status = 'ACKNOWLEDGED';
  return res.json({ success: true, alert });
});

export default router;
