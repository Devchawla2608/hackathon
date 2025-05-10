export interface SQLQuery {
  id: string;
  naturalLanguage: string;
  sqlQuery: string;
  confidence: number;
  timestamp: Date;
}

export interface VisualizationType {
  id: string;
  name: string;
  icon: string;
}

export interface TableSchema {
  id: string;
  name: string;
  columns: Column[];
  rowCount: number;
  selected: boolean;
}

export interface Column {
  name: string;
  type: string;
  description?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'scatter';
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}

export type Theme = 'light' | 'dark';