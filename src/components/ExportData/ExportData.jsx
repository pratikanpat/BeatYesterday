import { useState } from 'react';
import { Download, Check } from 'lucide-react';
import { downloadCSV } from '../../db/exportService.js';
import './ExportData.css';

/**
 * Export Data — Phase 3.5
 *
 * CSV export button. One tap → downloads all workout data.
 * Makes data feel safe. Useful even for 1 user.
 */
export default function ExportData() {
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    setSuccess(false);

    try {
      await downloadCSV();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="export-data" id="export-data">
      <div className="export-data__header">
        <h3 className="export-data__label">YOUR DATA</h3>
        <p className="export-data__desc">
          Download all workouts as CSV. Your data, your control.
        </p>
      </div>

      <button
        className="export-data__btn"
        onClick={handleExport}
        disabled={exporting}
        id="export-csv-btn"
      >
        <Download size={16} />
        {exporting ? 'EXPORTING...' : 'EXPORT ALL DATA (CSV)'}
      </button>

      {success && (
        <div className="export-data__success">
          <Check size={14} />
          Downloaded successfully
        </div>
      )}
    </div>
  );
}
