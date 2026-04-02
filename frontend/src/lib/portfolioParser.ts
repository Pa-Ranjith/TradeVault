import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { PortfolioItem } from '../services/nvidiaApi';

export async function parsePortfolioFile(file: File): Promise<PortfolioItem[]> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
        return parseCSV(file);
    } else if (['xlsx', 'xls'].includes(extension || '')) {
        return parseExcel(file);
    } else {
        throw new Error('Unsupported file format. Please upload CSV or Excel.');
    }
}

async function parseCSV(file: File): Promise<PortfolioItem[]> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data.map((row: any) => mapToPortfolioItem(row));
                resolve(data.filter(item => item.symbol && item.quantity > 0));
            },
            error: (error) => reject(error),
        });
    });
}

async function parseExcel(file: File): Promise<PortfolioItem[]> {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet);
    
    return json.map((row: any) => mapToPortfolioItem(row))
               .filter(item => item.symbol && item.quantity > 0);
}

function mapToPortfolioItem(row: any): PortfolioItem {
    // Attempt to handle various column name formats
    const symbol = row.Symbol || row.Ticker || row.stock || row.Instrument || '';
    const quantity = parseFloat(row.Quantity || row.Qty || row.units || '0');
    const avgPrice = parseFloat(row['Avg Price'] || row.AvgPrice || row.price || row.cost || '0');
    const sector = row.Sector || row.industry || row.segment || 'Unknown';
    
    return {
        symbol: symbol.toString().toUpperCase(),
        quantity,
        avgPrice,
        sector
    };
}
