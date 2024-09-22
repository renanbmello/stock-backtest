"use client";
import { useState } from "react";
import axios from "axios";

type Filters = {
  pl: [number, number];
  pvp: [number, number];
  dy: [number, number];
  mrgliq: [number, number];
  roe: [number, number];
  divbpatr: [number, number];
};

// Define the type for backtest results
type BacktestResult = {
  average_return: number;
  ibov_return: number;
  chart: string; // base64-encoded chart string
};

type BacktestResults = {
  [key: string]: BacktestResult; // e.g., "1y", "5y", "10y"
};

const FilterForm = () => {
  const [filters, setFilters] = useState<Filters>({
    pl: [0, 15],
    pvp: [0, 1],
    dy: [0.04, 100],
    mrgliq: [0.10, 100],
    roe: [0.10, 100],
    divbpatr: [0, 1],
  });

  const [companies, setCompanies] = useState<string[]>([]);
  const [backtestResults, setBacktestResults] = useState<BacktestResults | null>(null);

  const handleFilterChange = (key: keyof Filters, index: number, value: number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].map((v: number, i: number) => (i === index ? value : v)) as [number, number],
    }));
  };

  // Fetch filtered companies
  const fetchCompanies = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/empresas_perenes", { filters });
      console.log(response)
      setCompanies(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  // Fetch backtest data and chart
  const fetchBacktestData = async () => {
    try {
      if (companies.length === 0) {
        alert("Please filter companies first.");
        return;
      }

      const response = await axios.post("http://127.0.0.1:5000/backtest", { tickers: companies });
      setBacktestResults(response.data);
    } catch (error) {
      console.error("Error fetching backtest data:", error);
    }
  };

  return (
    <div className="dark:bg-gray-800 p-6">
      <h1 className="text-xl dark:text-white">Selecione os Filtros:</h1>
      <div className="space-y-4">
        {Object.keys(filters).map((key) => (
          <div key={key}>
            <label className="dark:text-gray-900">{key.toUpperCase()}</label>
            <div className="flex space-x-4">
              <input
                type="number"
                value={filters[key as keyof Filters][0]}
                onChange={(e) =>
                  handleFilterChange(key as keyof Filters, 0, parseFloat(e.target.value))
                }
                className="dark:bg-gray-700 dark:text-black"
              />
              <input
                type="number"
                value={filters[key as keyof Filters][1]}
                onChange={(e) =>
                  handleFilterChange(key as keyof Filters, 1, parseFloat(e.target.value))
                }
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        ))}
        <button onClick={fetchCompanies} className="dark:bg-green-500 p-2 text-white">
          Filtrar Empresas
        </button>
      </div>

      {companies.length > 0 && (
        <div className="mt-6">
          <h2 className="dark:text-white">Empresas Encontradas:</h2>
          <ul className="dark:text-gray-300">
            {companies.map((company) => (
              <li key={company}>{company}</li>
            ))}
          </ul>
        </div>
      )}

      {companies.length > 0 && (
        <button onClick={fetchBacktestData} className="dark:bg-blue-500 p-2 mt-4 text-white">
          Executar Backtest
        </button>
      )}

      {backtestResults && (
        <div className="mt-6">
          <h2 className="dark:text-white">Resultados do Backtest:</h2>
          {Object.keys(backtestResults).map((key) => (
            <div key={key} className="mt-4">
              <h3 className="dark:text-gray-300">{key}:</h3>
              <p className="dark:text-gray-300">
                Retorno Médio: {backtestResults[key].average_return}%
              </p>
              <p className="dark:text-gray-300">Retorno do Ibovespa: {backtestResults[key].ibov_return}%</p>
              <img
                src={`data:image/png;base64,${backtestResults[key].chart}`}
                alt={`${key} chart`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterForm;
