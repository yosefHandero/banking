"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, subMonths, subDays } from "date-fns";

interface TransactionFiltersProps {
  onFilterChange: (filters: {
    search: string;
    category: string;
    dateFrom: string;
    dateTo: string;
  }) => void;
}

export default function TransactionFilters({
  onFilterChange,
}: TransactionFiltersProps) {
  const [category, setCategory] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  const categories = [
    "All",
    "Food and Drink",
    "Travel",
    "Shopping",
    "Entertainment",
    "Bills",
    "Transfer",
    "Payment",
    "Other",
  ];

  // Apply filters whenever category or dates change
  useEffect(() => {
    onFilterChange({
      search: "", // No search input anymore
      category: category === "All" ? "" : category,
      dateFrom,
      dateTo,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, dateFrom, dateTo]);

  const handleQuickFilter = (period: "week" | "month" | "3months" | "year") => {
    const today = new Date();
    let from = "";
    const to = format(today, "yyyy-MM-dd");

    switch (period) {
      case "week":
        from = format(subDays(today, 7), "yyyy-MM-dd");
        break;
      case "month":
        from = format(startOfMonth(today), "yyyy-MM-dd");
        break;
      case "3months":
        from = format(startOfMonth(subMonths(today, 3)), "yyyy-MM-dd");
        break;
      case "year":
        from = format(startOfMonth(subMonths(today, 12)), "yyyy-MM-dd");
        break;
    }

    setDateFrom(from);
    setDateTo(to);
    setActiveQuickFilter(period);
    // Filters will be applied automatically via useEffect
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    // Filters will be applied automatically via useEffect
  };

  const handleClearFilters = () => {
    setCategory("All");
    setDateFrom("");
    setDateTo("");
    setActiveQuickFilter(null);
    // Filters will be applied automatically via useEffect
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#001122] rounded-lg shadow-form border border-gray-700">
      {/* Category Filter Section */}
      <div className="flex flex-col gap-2">
        <label htmlFor="category-filter" className="text-14 text-gray-300 font-medium">
          Category
        </label>
        <select
          id="category-filter"
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="input-class"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat} className="bg-[#001122] text-white">
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Filters Section */}
      <div className="flex flex-col gap-2">
        <label className="text-14 text-gray-300 font-medium">Quick Filters</label>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="ghost"
            onClick={() => handleQuickFilter("week")}
            className={`text-12 transition-colors ${
              activeQuickFilter === "week"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "text-gray-300 hover:text-white hover:bg-gray-800"
            }`}
          >
            This Week
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleQuickFilter("month")}
            className={`text-12 transition-colors ${
              activeQuickFilter === "month"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "text-gray-300 hover:text-white hover:bg-gray-800"
            }`}
          >
            This Month
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleQuickFilter("3months")}
            className={`text-12 transition-colors ${
              activeQuickFilter === "3months"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "text-gray-300 hover:text-white hover:bg-gray-800"
            }`}
          >
            Last 3 Months
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleQuickFilter("year")}
            className={`text-12 transition-colors ${
              activeQuickFilter === "year"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "text-gray-300 hover:text-white hover:bg-gray-800"
            }`}
          >
            This Year
          </Button>
          {(category !== "All" || dateFrom || dateTo) && (
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              className="text-12 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
