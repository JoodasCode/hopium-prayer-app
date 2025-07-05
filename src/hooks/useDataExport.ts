import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  dateRange?: {
    start: string;
    end: string;
  };
  includeStats?: boolean;
  includeGamification?: boolean;
  includeQadaPrayers?: boolean;
  includeNotifications?: boolean;
}

interface ExportData {
  user: any;
  prayerRecords: any[];
  userStats: any;
  gamification?: any;
  qadaPrayers?: any[];
  notifications?: any[];
  badges?: any[];
  challenges?: any[];
  xpTransactions?: any[];
  exportedAt: string;
  totalRecords: number;
}

interface UseDataExportReturn {
  isExporting: boolean;
  error: string | null;
  exportUserData: (userId: string, options: ExportOptions) => Promise<string | null>;
  downloadExport: (data: string, filename: string, format: string) => void;
  generateBackup: (userId: string) => Promise<string | null>;
  validateExportData: (data: ExportData) => boolean;
}

export function useDataExport(): UseDataExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async (userId: string, options: ExportOptions): Promise<ExportData | null> => {
    try {
      // Base user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Prayer records with date filtering
      let prayerQuery = supabase
        .from('prayer_records')
        .select('*')
        .eq('user_id', userId);

      if (options.dateRange) {
        prayerQuery = prayerQuery
          .gte('scheduled_time', options.dateRange.start)
          .lte('scheduled_time', options.dateRange.end);
      }

      const { data: prayerRecords, error: prayerError } = await prayerQuery
        .order('scheduled_time', { ascending: false });

      if (prayerError) throw prayerError;

      // User stats
      const { data: userStats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (statsError && statsError.code !== 'PGRST116') throw statsError;

      const exportData: ExportData = {
        user: userData,
        prayerRecords: prayerRecords || [],
        userStats: userStats || null,
        exportedAt: new Date().toISOString(),
        totalRecords: (prayerRecords || []).length
      };

      // Optional gamification data
      if (options.includeGamification) {
        const { data: gamificationData } = await supabase
          .from('user_gamification')
          .select('*')
          .eq('user_id', userId)
          .single();

        const { data: badges } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', userId);

        const { data: challenges } = await supabase
          .from('user_challenges')
          .select('*')
          .eq('user_id', userId);

        const { data: xpTransactions } = await supabase
          .from('xp_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        exportData.gamification = gamificationData;
        exportData.badges = badges || [];
        exportData.challenges = challenges || [];
        exportData.xpTransactions = xpTransactions || [];
      }

      // Optional qada prayers
      if (options.includeQadaPrayers) {
        const { data: qadaPrayers } = await supabase
          .from('qada_prayers')
          .select('*')
          .eq('user_id', userId);

        exportData.qadaPrayers = qadaPrayers || [];
      }

      // Optional notifications
      if (options.includeNotifications) {
        const { data: notifications } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId);

        exportData.notifications = notifications || [];
      }

      return exportData;
    } catch (err) {
      console.error('Error fetching user data for export:', err);
      throw err;
    }
  };

  const formatAsJSON = (data: ExportData): string => {
    return JSON.stringify(data, null, 2);
  };

  const formatAsCSV = (data: ExportData): string => {
    const csvLines: string[] = [];
    
    // Header
    csvLines.push('Export Type,Date,Data');
    csvLines.push(`User Data,${data.exportedAt},"${JSON.stringify(data.user).replace(/"/g, '""')}"`);
    
    // Prayer records
    if (data.prayerRecords.length > 0) {
      csvLines.push(''); // Empty line
      csvLines.push('Prayer Records');
      csvLines.push('Date,Prayer Type,Completed,Completed Time,Notes,Emotional State Before,Emotional State After');
      
      data.prayerRecords.forEach(prayer => {
        const line = [
          prayer.scheduled_time,
          prayer.prayer_type,
          prayer.completed ? 'Yes' : 'No',
          prayer.completed_time || '',
          (prayer.notes || '').replace(/"/g, '""'),
          prayer.emotional_state_before || '',
          prayer.emotional_state_after || ''
        ].map(field => `"${field}"`).join(',');
        
        csvLines.push(line);
      });
    }

    // User stats
    if (data.userStats) {
      csvLines.push(''); // Empty line
      csvLines.push('User Statistics');
      csvLines.push('Metric,Value');
      
      Object.entries(data.userStats).forEach(([key, value]) => {
        csvLines.push(`"${key}","${value}"`);
      });
    }

    // Gamification data
    if (data.gamification) {
      csvLines.push(''); // Empty line
      csvLines.push('Gamification Data');
      csvLines.push('Metric,Value');
      
      Object.entries(data.gamification).forEach(([key, value]) => {
        csvLines.push(`"${key}","${value}"`);
      });
    }

    // XP Transactions
    if (data.xpTransactions && data.xpTransactions.length > 0) {
      csvLines.push(''); // Empty line
      csvLines.push('XP Transactions');
      csvLines.push('Date,Amount,Source,Description');
      
      data.xpTransactions.forEach((transaction: any) => {
        const line = [
          transaction.created_at,
          transaction.amount,
          transaction.source,
          (transaction.description || '').replace(/"/g, '""')
        ].map(field => `"${field}"`).join(',');
        
        csvLines.push(line);
      });
    }

    return csvLines.join('\n');
  };

  const formatAsPDF = (data: ExportData): string => {
    // For PDF generation, we'll return HTML that can be converted to PDF
    // In a real implementation, you'd use a library like jsPDF or Puppeteer
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Prayer Data Export</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1, h2 { color: #2563eb; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>Prayer Data Export</h1>
    <p><strong>Exported on:</strong> ${new Date(data.exportedAt).toLocaleString()}</p>
    <p><strong>User:</strong> ${data.user.display_name || 'Anonymous'}</p>
    <p><strong>Total Prayer Records:</strong> ${data.totalRecords}</p>

    ${data.userStats ? `
    <h2>Statistics Summary</h2>
    <div class="stats">
        <div class="stat-card">
            <h3>Prayer Completion</h3>
            <p><strong>Total Completed:</strong> ${data.userStats.total_prayers_completed || 0}</p>
            <p><strong>Completion Rate:</strong> ${(data.userStats.completion_rate || 0).toFixed(1)}%</p>
            <p><strong>Current Streak:</strong> ${data.userStats.current_streak || 0} days</p>
        </div>
        ${data.gamification ? `
        <div class="stat-card">
            <h3>Gamification</h3>
            <p><strong>Level:</strong> ${data.gamification.level}</p>
            <p><strong>Total XP:</strong> ${data.gamification.total_xp}</p>
            <p><strong>Rank:</strong> ${data.gamification.rank}</p>
        </div>
        ` : ''}
    </div>
    ` : ''}

    <h2>Recent Prayer Records</h2>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Prayer</th>
                <th>Status</th>
                <th>Notes</th>
            </tr>
        </thead>
        <tbody>
            ${data.prayerRecords.slice(0, 50).map(prayer => `
            <tr>
                <td>${new Date(prayer.scheduled_time).toLocaleDateString()}</td>
                <td>${prayer.prayer_type}</td>
                <td>${prayer.completed ? '✅ Completed' : '❌ Missed'}</td>
                <td>${prayer.notes || '-'}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>

    ${data.prayerRecords.length > 50 ? `
    <p><em>Showing first 50 records. Total records: ${data.prayerRecords.length}</em></p>
    ` : ''}
</body>
</html>
    `;
    
    return html;
  };

  const exportUserData = async (userId: string, options: ExportOptions): Promise<string | null> => {
    setIsExporting(true);
    setError(null);

    try {
      const data = await fetchUserData(userId, options);
      if (!data) return null;

      let formattedData: string;

      switch (options.format) {
        case 'json':
          formattedData = formatAsJSON(data);
          break;
        case 'csv':
          formattedData = formatAsCSV(data);
          break;
        case 'pdf':
          formattedData = formatAsPDF(data);
          break;
        default:
          throw new Error('Unsupported export format');
      }

      return formattedData;
    } catch (err) {
      console.error('Error exporting user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to export data');
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  const downloadExport = (data: string, filename: string, format: string) => {
    try {
      let mimeType: string;
      
      switch (format) {
        case 'json':
          mimeType = 'application/json';
          break;
        case 'csv':
          mimeType = 'text/csv';
          break;
        case 'pdf':
          mimeType = 'text/html'; // Will be converted to PDF by browser or external service
          break;
        default:
          mimeType = 'text/plain';
      }

      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading export:', err);
      setError(err instanceof Error ? err.message : 'Failed to download export');
    }
  };

  const generateBackup = async (userId: string): Promise<string | null> => {
    const backupOptions: ExportOptions = {
      format: 'json',
      includeStats: true,
      includeGamification: true,
      includeQadaPrayers: true,
      includeNotifications: true
    };

    return await exportUserData(userId, backupOptions);
  };

  const validateExportData = (data: ExportData): boolean => {
    try {
      // Basic validation checks
      if (!data.user || !data.user.id) return false;
      if (!Array.isArray(data.prayerRecords)) return false;
      if (!data.exportedAt) return false;
      if (typeof data.totalRecords !== 'number') return false;

      // Validate prayer records structure
      for (const prayer of data.prayerRecords) {
        if (!prayer.id || !prayer.prayer_type || !prayer.scheduled_time) {
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error('Error validating export data:', err);
      return false;
    }
  };

  return {
    isExporting,
    error,
    exportUserData,
    downloadExport,
    generateBackup,
    validateExportData
  };
} 