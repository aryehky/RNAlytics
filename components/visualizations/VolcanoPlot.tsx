"use client";

import React, { useState, useEffect } from "react";
import Plot from 'react-plotly.js';
import { PlotControls } from "./PlotControls";
import { BarChart } from "lucide-react";

interface DataPoint {
  gene: string;
  logFC: number;
  pValue: number;
}

export const VolcanoPlot: React.FC = () => {
  const [pValueThreshold, setPValueThreshold] = useState<number>(0.05);
  const [fcThreshold, setFcThreshold] = useState<number>(1.5);
  const [plotData, setPlotData] = useState<DataPoint[]>([]);

  useEffect(() => {
    // Fetch your data here
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data/differential-expression');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPlotData(data);
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error details:', error.message);
        } else {
          console.error('Unknown error:', error);
        }
      }
    };
    fetchData();
  }, []);

  const getPlotlyData = () => {
    const significant = plotData.filter(
      d => Math.abs(d.logFC) >= Math.log2(fcThreshold) && d.pValue <= pValueThreshold
    );
    const nonsignificant = plotData.filter(
      d => Math.abs(d.logFC) < Math.log2(fcThreshold) || d.pValue > pValueThreshold
    );

    return [
      {
        x: significant.map(d => d.logFC),
        y: significant.map(d => -Math.log10(d.pValue)),
        mode: 'markers',
        type: 'scatter',
        name: 'Significant',
        marker: {
          color: '#ff1493',
          size: 8
        },
        text: significant.map(d => d.gene),
        hoverinfo: 'text+x+y'
      },
      {
        x: nonsignificant.map(d => d.logFC),
        y: nonsignificant.map(d => -Math.log10(d.pValue)),
        mode: 'markers',
        type: 'scatter',
        name: 'Non-significant',
        marker: {
          color: '#808080',
          size: 6
        },
        text: nonsignificant.map(d => d.gene),
        hoverinfo: 'text+x+y'
      }
    ];
  };

  return (
    <div className="p-6 border-t-4 border-t-purple-500">
      <div className="flex items-center gap-2 mb-6">
        <BarChart className="h-5 w-5 text-purple-500" />
        <h2 className="text-xl font-semibold">Differential Expression Analysis</h2>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 h-[calc(100vh-24rem)]">
        <PlotControls
          type="volcano"
          pValueThreshold={pValueThreshold}
          fcThreshold={fcThreshold}
          onPValueChange={setPValueThreshold}
          onFcChange={setFcThreshold}
        />

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg h-[calc(100%-4rem)] flex items-center justify-center border border-slate-200 dark:border-slate-700">
          {plotData.length > 0 ? (
            <Plot
              data={getPlotlyData() as Plotly.Data[]}
              layout={{
                title: 'Volcano Plot',
                xaxis: { title: 'Log2 Fold Change' },
                yaxis: { title: '-log10(p-value)' },
                showlegend: true,
                plot_bgcolor: 'transparent',
                paper_bgcolor: 'transparent'
              }}
              useResizeHandler={true}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <p className="text-muted-foreground">Loading data...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolcanoPlot;

