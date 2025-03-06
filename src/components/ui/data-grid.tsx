
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

interface DataGridProps {
  rowData: any[];
  columnDefs: any[];
  onRowClick?: (row: any) => void;
  className?: string;
  pagination?: boolean;
  paginationPageSize?: number;
  height?: string;
  loading?: boolean;
}

export function DataGrid({
  rowData,
  columnDefs,
  onRowClick,
  className,
  pagination = true,
  paginationPageSize = 10,
  height = "60vh",
  loading = false,
}: DataGridProps) {
  const [gridApi, setGridApi] = useState<any>(null);
  const [gridColumnApi, setGridColumnApi] = useState<any>(null);

  useEffect(() => {
    if (gridApi) {
      if (loading) {
        gridApi.showLoadingOverlay();
      } else {
        gridApi.hideOverlay();
      }
    }
  }, [loading, gridApi]);

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 100,
  };

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    params.api.sizeColumnsToFit();
  };

  const handleRowClicked = (event: any) => {
    if (onRowClick) {
      onRowClick(event.data);
    }
  };

  // Fade in animation for rows
  const onRowDataUpdated = () => {
    if (gridApi) {
      gridApi.forEachNode((node: any, index: number) => {
        node.style = {
          "animation": `fade-in 0.3s ${index * 0.05}s both`,
        };
      });
    }
  };

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-lg transition-all duration-300 animate-blur-in", 
        className
      )}
      style={{ height }}
    >
      <div className="ag-theme-alpine w-full h-full">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          pagination={pagination}
          paginationPageSize={paginationPageSize}
          animateRows={true}
          rowClass="animate-fade-in"
          suppressRowClickSelection={true}
          onRowClicked={handleRowClicked}
          onRowDataUpdated={onRowDataUpdated}
          suppressMovableColumns={true}
          domLayout="autoHeight"
          overlayLoadingTemplate="<span class='flex items-center justify-center h-full'>Loading data...</span>"
          overlayNoRowsTemplate="<span class='flex items-center justify-center h-full'>No data available</span>"
        />
      </div>
    </div>
  );
}
