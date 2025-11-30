"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, subMonths, subDays } from "date-fns";

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
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

  const handleQuickFilter = (period: "week" | "month" | "3months" | "year") => {
    const today = new Date();
    let from = "";
    let to = format(today, "yyyy-MM-dd");

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
    onFilterChange({ search, category, dateFrom: from, dateTo: to });
  };

  const handleApplyFilters = () => {
    onFilterChange({
      search,
      category: category === "All" ? "" : category,
      dateFrom,
      dateTo,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#001122] rounded-lg shadow-form border border-gray-700">
      <div className="flex flex-col gap-4 md:flex-row">
        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-class flex-1"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-class"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2 md:flex-row">
        <input
          type="date"
          placeholder="From"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="input-class"
        />
        <input
          type="date"
          placeholder="To"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="input-class"
        />
        <Button onClick={handleApplyFilters} className="form-btn">
          Apply Filters
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant="ghost"
          onClick={() => handleQuickFilter("week")}
          className="text-12"
        >
          This Week
        </Button>
        <Button
          variant="ghost"
          onClick={() => handleQuickFilter("month")}
          className="text-12"
        >
          This Month
        </Button>
        <Button
          variant="ghost"
          onClick={() => handleQuickFilter("3months")}
          className="text-12"
        >
          Last 3 Months
        </Button>
        <Button
          variant="ghost"
          onClick={() => handleQuickFilter("year")}
          className="text-12"
        >
          This Year
        </Button>
      </div>
    </div>
  );
}
