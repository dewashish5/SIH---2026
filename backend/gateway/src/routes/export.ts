import { Router, Request, Response } from 'express';
import ExcelJS from 'exceljs';
import { stringify } from 'csv-stringify';

export const exportRouter = Router();

const SAMPLE_TARGETS = [
  {
    state: 'Rajasthan',
    district: 'Jaipur',
    sector: 'Electrical & Solar Energy',
    trade: 'Solar PV Technician',
    nco: '7421.0301',
    nsqf: 4,
    demandP50: 5200,
    supplyP50: 2900,
    gap: 2300,
    gapRatio: '+44.2%',
    riskLabel: 'Critical Shortage',
    recommendedSeatChange: '+350',
    sourceFlag: 'dummy',
    qualityScore: 88.5,
    lowConfidence: false,
    runId: 'run_202610_01',
    exportedAt: new Date().toISOString()
  },
  {
    state: 'Rajasthan',
    district: 'Jaipur',
    sector: 'Electrical & Solar Energy',
    trade: 'Electrician',
    nco: '7411.0100',
    nsqf: 4,
    demandP50: 1800,
    supplyP50: 3200,
    gap: -1400,
    gapRatio: '-77.8%',
    riskLabel: 'Saturation',
    recommendedSeatChange: '-600',
    sourceFlag: 'dummy',
    qualityScore: 91.0,
    lowConfidence: false,
    runId: 'run_202610_01',
    exportedAt: new Date().toISOString()
  },
  {
    state: 'Maharashtra',
    district: 'Pune',
    sector: 'Automotive & Electric Vehicles',
    trade: 'EV Service Technician',
    nco: '7231.0102',
    nsqf: 4,
    demandP50: 4100,
    supplyP50: 2500,
    gap: 1600,
    gapRatio: '+39.0%',
    riskLabel: 'Critical Shortage',
    recommendedSeatChange: '+280',
    sourceFlag: 'dummy',
    qualityScore: 86.2,
    lowConfidence: false,
    runId: 'run_202610_01',
    exportedAt: new Date().toISOString()
  },
  {
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    sector: 'IT-ITeS & Digital Services',
    trade: 'AI Data Annotator',
    nco: '2519.0301',
    nsqf: 4,
    demandP50: 3800,
    supplyP50: 2700,
    gap: 1100,
    gapRatio: '+28.9%',
    riskLabel: 'Shortage',
    recommendedSeatChange: '+190',
    sourceFlag: 'dummy',
    qualityScore: 89.4,
    lowConfidence: false,
    runId: 'run_202610_01',
    exportedAt: new Date().toISOString()
  }
];

exportRouter.get('/export/targets.csv', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="SkillGap_Target_Allocations_2026.csv"');

  const stringifier = stringify({ header: true });
  stringifier.pipe(res);

  // Disclaimer comment row
  stringifier.write({
    state: '# DISCLAIMER: PILOT DEMO DATA (MSDE SIH 2026). Forecasted values are modelled/dummy estimates.',
    district: '',
    sector: '',
    trade: '',
    nco: '',
    nsqf: '',
    demandP50: '',
    supplyP50: '',
    gap: '',
    gapRatio: '',
    riskLabel: '',
    recommendedSeatChange: '',
    sourceFlag: '',
    qualityScore: '',
    lowConfidence: '',
    runId: '',
    exportedAt: ''
  });

  for (const row of SAMPLE_TARGETS) {
    stringifier.write(row);
  }
  stringifier.end();
});

exportRouter.get('/export/targets.xlsx', async (_req: Request, res: Response) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Ministry of Skill Development and Entrepreneurship';
  workbook.created = new Date();

  // Sheet 1: Disclaimer & Methodology
  const infoSheet = workbook.addWorksheet('Notice & Methodology');
  infoSheet.columns = [{ width: 30 }, { width: 70 }];
  infoSheet.addRow(['Parameter', 'Specification Details']);
  infoSheet.addRow(['System', 'SkillGap Intelligence (PS 26246)']);
  infoSheet.addRow(['Pilot Scope', 'Rajasthan, Maharashtra, Karnataka (18 Trades)']);
  infoSheet.addRow(['Refresh Cadence', 'Monthly batch periodic refresh']);
  infoSheet.addRow(['Disclaimer', 'Contains dummy / modelled benchmark data. For planner target-setting preview only.']);

  // Sheet 2: Target Allocations Data
  const dataSheet = workbook.addWorksheet('Target Allocations');
  dataSheet.columns = [
    { header: 'State', key: 'state', width: 16 },
    { header: 'District', key: 'district', width: 18 },
    { header: 'Sector', key: 'sector', width: 28 },
    { header: 'Trade', key: 'trade', width: 26 },
    { header: 'NCO Code', key: 'nco', width: 14 },
    { header: 'NSQF Level', key: 'nsqf', width: 12 },
    { header: 'Demand P50', key: 'demandP50', width: 14 },
    { header: 'Supply P50', key: 'supplyP50', width: 14 },
    { header: 'Gap (Flow)', key: 'gap', width: 14 },
    { header: 'Gap Ratio', key: 'gapRatio', width: 14 },
    { header: 'Risk Classification', key: 'riskLabel', width: 18 },
    { header: 'Seat Recommendation', key: 'recommendedSeatChange', width: 20 },
    { header: 'Source Flag', key: 'sourceFlag', width: 14 },
    { header: 'Quality Score', key: 'qualityScore', width: 14 }
  ];

  for (const row of SAMPLE_TARGETS) {
    dataSheet.addRow(row);
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="SkillGap_Target_Allocations_2026.xlsx"');

  await workbook.xlsx.write(res);
  res.end();
});
