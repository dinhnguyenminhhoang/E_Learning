export interface Mission {
  id: string;
  type: "daily" | "review";
  title: string;
  description: string;
  progress: number;
  total: number;
  icon: string;
  locked?: boolean;
  requirement?: string;
}

export interface Topic {
  id: string;
  name: string;
  progress: number;
  total: number;
  icon: string;
}

export interface WordLevel {
  level: string;
  count: number;
  label: string;
}
interface SubTopic {
  id: string;
  name: string;
  progress: number;
  total: number;
  icon: string;
}

interface Topic {
  id: number;
  name: string;
  totalTopics: number;
  progressPercent: number;
  subTopics: SubTopic[];
}
